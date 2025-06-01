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
    // Calculate the start date for exactly 8 weeks ago
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (8 * 7)); // 8 weeks = 56 days

    // Get analytics data for leads
    const analyticsData = await Lead.aggregate([
      {
        $match: { createdBy: req.user.email }
      },
      {
        $facet: {
          // Weekly trends for leads - last 8 weeks
          weeklyLeadTrends: [
            {
              $match: { 
                createdAt: { $gte: startDate }, 
                createdBy: req.user.email 
              }
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
              $match: { 
                createdAt: { $gte: startDate }
              }
            },
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
              $match: { 
                createdAt: { $gte: startDate }
              }
            },
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
              $match: { 
                createdAt: { $gte: startDate },
                industry: { $exists: true, $ne: null, $ne: "" } 
              }
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
              $match: { 
                createdAt: { $gte: startDate }
              }
            },
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

    // Get contacts data for the last 8 weeks
    const contactsData = await Contact.aggregate([
      {
        $facet: {
          // Weekly trends for contacts - last 8 weeks
          weeklyContactTrends: [
            {
              $match: { 
                createdAt: { $gte: startDate }, 
                createdBy: req.user.email 
              }
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
              $match: { 
                createdAt: { $gte: startDate },
                createdBy: req.user.email 
              }
            },
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

    // Create a complete set of the last 8 weeks
    const weeklyTrendsComplete = [];
    const currentDate = new Date();
    
    for (let i = 7; i >= 0; i--) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(currentDate.getDate() - (i * 7));
      
      const year = weekDate.getFullYear();
      const week = getWeekNumber(weekDate);
      
      weeklyTrendsComplete.push({
        name: `Week ${week}, ${year}`,
        year: year,
        week: week,
        leads: 0,
        converted: 0,
        contacts: 0
      });
    }

    // Merge weekly trends data (leads and contacts)
    const leadTrends = analyticsData[0].weeklyLeadTrends;
    const contactTrends = contactsData[0].weeklyContactTrends;

    // Create a map for easier merging
    const trendsMap = new Map();

    // Initialize with complete weeks (all zeros)
    weeklyTrendsComplete.forEach(week => {
      const key = `${week.year}-${week.week}`;
      trendsMap.set(key, week);
    });

    // Add lead data
    leadTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.week}`;
      if (trendsMap.has(key)) {
        const existing = trendsMap.get(key);
        existing.leads = item.leads;
        existing.converted = item.converted;
      }
    });

    // Add contact data
    contactTrends.forEach(item => {
      const key = `${item._id.year}-${item._id.week}`;
      if (trendsMap.has(key)) {
        const existing = trendsMap.get(key);
        existing.contacts = item.contacts;
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

    // Remove the old weekly lead trends since we're now using combined weeklyTrends
    delete combinedAnalytics.weeklyLeadTrends;

    res.json(combinedAnalytics);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to get week number
function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

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