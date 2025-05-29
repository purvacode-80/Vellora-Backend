const Contact = require('../Model/contact_model');
const Lead = require('../Model/lead_model');

// Get all leads
const getAllLeads = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    const leads = await Lead.find({
      createdAt: { $gte: dateFilter },
      createdBy: req.user.email,
    }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    const contacts = await Contact.find({
      createdAt: { $gte: dateFilter },
      createdBy: req.user.email,
    }).sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================================
// ADVANCED ANALYTICS ENDPOINTS
// ================================

// Get comprehensive analytics
const advanced = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get analytics data for leads
    const analyticsData = await Lead.aggregate([
      {
        $match: { createdBy: req.user.email }
      },
      {
        $facet: {
          // Weekly trends for leads
          weeklyLeadTrends: [
            {
              $match: { createdAt: { $gte: startDate }, createdBy: req.user.email }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  week: { $week: "$createdAt" }
                },
                leads: { $sum: 1 },
                converted: {
                  $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] }
                },
                revenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "Converted"] },
                      { $ifNull: ["$estimatedValue", 0] },
                      0
                    ]
                  }
                }
              }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } }
          ],

          // Lead source analysis
          sourceAnalysis: [
            {
              $group: {
                _id: "$leadSource",
                count: { $sum: 1 },
                converted: {
                  $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] }
                },
                conversionRate: {
                  $avg: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] }
                }
              }
            }
          ],

          // Status distribution
          statusDistribution: [
            {
              $group: {
                _id: "$status",
                count: { $sum: 1 }
              }
            }
          ],

          // Industry performance
          industryPerformance: [
            {
              $match: { industry: { $exists: true, $ne: null, $ne: "" } }
            },
            {
              $group: {
                _id: "$industry",
                leads: { $sum: 1 },
                converted: {
                  $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] }
                },
              }
            },
            {
              $addFields: {
                conversionRate: {
                  $cond: [
                    { $gt: ["$leads", 0] },
                    { $multiply: [{ $divide: ["$converted", "$leads"] }, 100] },
                    0
                  ]
                }
              }
            }
          ],

          // User performance
          userPerformance: [
            {
              $group: {
                _id: "$createdBy",
                leadsCreated: { $sum: 1 },
                leadsConverted: {
                  $sum: { $cond: [{ $eq: ["$status", "Converted"] }, 1, 0] }
                },
                totalRevenue: {
                  $sum: {
                    $cond: [
                      { $eq: ["$status", "Converted"] },
                      { $ifNull: ["$estimatedValue", 0] },
                      0
                    ]
                  }
                }
              }
            }
          ]
        }
      }
    ]);

    // Get contacts data (assuming you have a Contact model)
    const contactsData = await Contact.aggregate([
      {
        $facet: {
          // Weekly trends for contacts
          weeklyContactTrends: [
            {
              $match: { createdAt: { $gte: startDate }, createdBy: req.user.email }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  week: { $week: "$createdAt" }
                },
                contacts: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.week": 1 } }
          ],

          // Contact source analysis
          contactSourceAnalysis: [
            {
              $group: {
                _id: "$contactSource",
                count: { $sum: 1 }
              }
            }
          ]
        }
      }
    ]);

    // Merge weekly trends data (leads and contacts)
    const leadTrends = analyticsData[0].weeklyLeadTrends;
    const contactTrends = contactsData[0].weeklyContactTrends;

    // Create a map for easier merging
    const trendsMap = new Map();

    // Add lead data
    leadTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.week}`;
      trendsMap.set(key, {
        name: `Week ${item._id.week}, ${item._id.year}`,
        year: item._id.year,
        week: item._id.week,
        leads: item.leads,
        converted: item.converted,
        contacts: 0 // Initialize contacts to 0
      });
    });

    // Add contact data
    contactTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.week}`;
      if (trendsMap.has(key)) {
        trendsMap.get(key).contacts = item.contacts;
      } else {
        trendsMap.set(key, {
          name: `Week ${item._id.week}, ${item._id.year}`,
          year: item._id.year,
          week: item._id.week,
          leads: 0,
          converted: 0,
          contacts: item.contacts
        });
      }
    });

    // Convert map to array and sort by year and week
    const weeklyTrends = Array.from(trendsMap.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.week - b.week;
    });

    // Combine all analytics data
    const combinedAnalytics = {
      ...analyticsData[0],
      weeklyTrends: weeklyTrends,
      contactSourceAnalysis: contactsData[0].contactSourceAnalysis
    };

    // Remove the old monthly trends since we're now using weekly
    delete combinedAnalytics.weeklyLeadTrends;

    res.json(combinedAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get dashboard summary
const summary = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [leadStats, contactStats] = await Promise.all([
      Lead.aggregate([
        { $match: { createdBy: req.user.email} },
        { $facet: {
            total: [{ $count: "count" }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ],
            converted: [
              { $match: { status: "Converted" } },
              { $count: "count" }
            ],
            revenue: [
              { $match: { status: "Converted" } },
              { $group: { _id: null, total: { $sum: { $ifNull: ["$estimatedValue", 0] } } } }
            ]
          }
      }
      ]),
      Contact.aggregate([
        { $match: { createdBy: req.user.email } },
        { $facet: {
            total: [{ $count: "count" }],
            recent: [
              { $match: { createdAt: { $gte: startDate } } },
              { $count: "count" }
            ],
            active: [
              { $match: { status: "Active" } },
              { $count: "count" }
            ]
          }
        }
      ])
    ]);

    const summary = {
      leads: {
        total: leadStats[0].total[0]?.count || 0,
        recent: leadStats[0].recent[0]?.count || 0,
        converted: leadStats[0].converted[0]?.count || 0,
        revenue: leadStats[0].revenue[0]?.total || 0
      },
      contacts: {
        total: contactStats[0].total[0]?.count || 0,
        recent: contactStats[0].recent[0]?.count || 0,
        active: contactStats[0].active[0]?.count || 0
      }
    };

    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================================
// REAL-TIME DATA ENDPOINTS
// ================================

// Get recent activities
const recentActivities = async (req, res) => {
  try {
    const recentLeads = await Lead.find({createdBy: req.user.email})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('companyName fullName createdAt status leadSource');

    const recentContacts = await Contact.find({createdBy: req.user.email})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('fullName company createdAt status');

    res.json({
      recentLeads,
      recentContacts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllLeads, getAllContacts, advanced, summary, recentActivities };