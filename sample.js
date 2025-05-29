// Get all leads
app.get('/api/leads', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    const leads = await Lead.find({
      createdAt: { $gte: dateFilter }
    }).sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all contacts
app.get('/api/contacts', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const dateFilter = new Date();
    dateFilter.setDate(dateFilter.getDate() - parseInt(days));

    const contacts = await Contact.find({
      createdAt: { $gte: dateFilter }
    }).sort({ createdAt: -1 });

    res.json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ================================
// ADVANCED ANALYTICS ENDPOINTS
// ================================

// Get comprehensive analytics
app.get('/api/analytics/advanced', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const analyticsData = await Lead.aggregate([
      {
        $facet: {
          // Monthly trends
          monthlyTrends: [
            {
              $match: { createdAt: { $gte: startDate } }
            },
            {
              $group: {
                _id: {
                  year: { $year: "$createdAt" },
                  month: { $month: "$createdAt" }
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
            { $sort: { "_id.year": 1, "_id.month": 1 } }
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
                avgDealValue: {
                  $avg: { $ifNull: ["$estimatedValue", 0] }
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

    res.json(analyticsData[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get predictive analytics
app.get('/api/analytics/predictive', async (req, res) => {
  try {
    const leads = await Lead.find({});
    
    // Lead scoring algorithm
    const scoredLeads = leads.map(lead => {
      let score = 0;
      
      // Priority scoring
      if (lead.priority === 'High') score += 30;
      else if (lead.priority === 'Medium') score += 20;
      else score += 10;
      
      // Source scoring
      const sourceScores = {
        'Referral': 25,
        'Website': 20,
        'Social Media': 15,
        'Email Campaign': 15,
        'Trade Show': 20,
        'Cold Call': 10,
        'Other': 5
      };
      score += sourceScores[lead.leadSource] || 5;
      
      // Recency scoring
      const daysSinceCreated = (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 20;
      else if (daysSinceCreated < 30) score += 15;
      else score += 5;
      
      // Industry scoring (if available)
      if (lead.industry) {
        const industryScores = {
          'Technology': 25,
          'Finance': 20,
          'Healthcare': 20,
          'Manufacturing': 15,
          'Retail': 10,
          'Education': 10,
          'Real Estate': 15
        };
        score += industryScores[lead.industry] || 10;
      }
      
      return { ...lead.toObject(), score: Math.min(score, 100) };
    });

    const highValueLeads = scoredLeads.filter(lead => lead.score >= 70);
    
    // Calculate predictions
    const convertedLeads = leads.filter(l => l.status === 'Converted');
    const avgDealValue = convertedLeads.reduce((sum, l) => sum + (l.estimatedValue || 0), 0) / convertedLeads.length || 0;
    const conversionRate = convertedLeads.length / leads.length;
    const pipelineValue = leads.filter(l => l.status === 'In Progress').reduce((sum, l) => sum + ((l.estimatedValue || 0) * conversionRate), 0);

    res.json({
      highValueLeads,
      avgDealValue,
      pipelineValue,
      conversionRate: (conversionRate * 100).toFixed(1),
      totalScored: scoredLeads.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get dashboard summary
app.get('/api/analytics/summary', async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const [leadStats, contactStats] = await Promise.all([
      Lead.aggregate([
        {
          $facet: {
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
        {
          $facet: {
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
});

// ================================
// REAL-TIME DATA ENDPOINTS
// ================================

// Get recent activities
app.get('/api/activities/recent', async (req, res) => {
  try {
    const recentLeads = await Lead.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('companyName fullName createdAt status leadSource');

    const recentContacts = await Contact.find({})
      .sort({ createdAt: -1 })
      .limit(10)
      .select('fullName company createdAt status');

    res.json({
      recentLeads,
      recentContacts
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});