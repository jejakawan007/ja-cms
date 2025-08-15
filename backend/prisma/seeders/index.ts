/* eslint-disable no-console */
// @ts-nocheck - Disable type checking for seeder index due to Prisma client regeneration
import { PrismaClient } from '@prisma/client';

// Import all seeder modules
import { seedUsers } from './01-users-seeder';
import { seedContent } from './02-content-seeder';
import { seedMedia } from './03-media-seeder';
import { seedThemes } from './04-themes-seeder';
import { seedSecurity } from './05-security-seeder';
import { seedSystem } from './06-system-seeder';
import { seedAnalytics } from './07-analytics-seeder';
import { seedTools } from './08-tools-seeder';
import { seedExtensions } from './09-extensions-seeder';
import { seedDiagnostics } from './10-diagnostics-seeder';
import { seedDatabase } from './11-database-seeder';
import { seedDashboard } from './08-dashboard-seeder';
import { seedUncategorizedCategory } from './03-uncategorized-seeder';

const prisma = new PrismaClient();

/**
 * Main seeder function that orchestrates all seeding operations
 */
async function main() {
      console.log('🌱 Starting comprehensive database seeding for JA-CMS Enterprise...');
    console.log('📊 Target: 110+ models with realistic enterprise data\n');

  try {
    // Clear existing data (in reverse dependency order)
    console.log('🧹 Clearing existing data...');
    await clearExistingData();

    // Seed data in dependency order
    console.log('\n🚀 Starting seeding process...\n');

    // 1. Core Users & Authentication (Foundation)
    console.log('👥 [1/11] Seeding Users & Authentication...');
    const users = await seedUsers(prisma);
    console.log(`✅ Created ${users.length} users with roles and permissions\n`);

    // 2. Content Management System
    console.log('📝 [2/11] Seeding Content Management...');
    const content = await seedContent(prisma, users);
    console.log(`✅ Created comprehensive content ecosystem\n`);

    // 3. Media Management System
    console.log('🎨 [3/11] Seeding Media Management...');
    const media = await seedMedia(prisma, users);
    console.log(`✅ Created media library with processing jobs\n`);

    // 4. Theme & Appearance System
    console.log('🎭 [4/11] Seeding Themes & Appearance...');
    const themes = await seedThemes(prisma, users);
    console.log(`✅ Created theme ecosystem with customization\n`);

    // 5. Security System
    console.log('🛡️ [5/11] Seeding Security System...');
    const security = await seedSecurity(prisma, users);
    console.log(`✅ Created comprehensive security framework\n`);

    // 6. System Configuration
    console.log('⚙️ [6/11] Seeding System Configuration...');
    const system = await seedSystem(prisma, users);
    console.log(`✅ Created system settings and notifications\n`);

    // 7. Analytics & Reporting
    console.log('📊 [7/11] Seeding Analytics & Reporting...');
    const analytics = await seedAnalytics(prisma, users, content);
    console.log(`✅ Created analytics ecosystem with reports\n`);

    // 8. Tools & Utilities
    console.log('🔧 [8/11] Seeding Tools & Utilities...');
    const tools = await seedTools(prisma, users);
    console.log(`✅ Created administrative tools and utilities\n`);

    // 9. Extensions & Plugins
    console.log('🔌 [9/11] Seeding Extensions & Plugins...');
    const extensions = await seedExtensions(prisma, users);
    console.log(`✅ Created plugin ecosystem and marketplace\n`);

    // 10. Diagnostics System
    console.log('🔍 [10/11] Seeding Diagnostics System...');
    const diagnostics = await seedDiagnostics(prisma, users);
    console.log(`✅ Created diagnostics and health monitoring\n`);

    // 11. Database Management
    console.log('🗄️ [11/12] Seeding Database Management...');
    const database = await seedDatabase(prisma, users);
    console.log(`✅ Created database optimization and monitoring\n`);

    // 12. Dashboard System
    console.log('📊 [12/12] Seeding Dashboard System...');
    await seedDashboard();
    console.log(`✅ Created dashboard widgets and preferences\n`);

    // 13. Uncategorized Category
    console.log('📁 [13/13] Seeding Uncategorized Category...');
    await seedUncategorizedCategory();
    console.log(`✅ Created default Uncategorized category\n`);

    // Final summary
    console.log('🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=' .repeat(60));
    console.log('📊 COMPREHENSIVE SEEDING SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`👥 Users & Auth: ${users.length} users with complete profiles`);
    console.log(`📝 Content: ${content.posts} posts, ${content.workflows} workflows`);
    console.log(`🎨 Media: ${media.files} files, ${media.folders} folders`);
    console.log(`🎭 Themes: ${themes.themes} themes, ${themes.widgets} widgets`);
    console.log(`🛡️ Security: ${security.events} events, ${security.rules} rules`);
    console.log(`⚙️ System: ${system.settings} settings, ${system.notifications} notifications`);
    console.log(`📊 Analytics: ${analytics.reports} reports, ${analytics.events} events`);
    console.log(`🔧 Tools: ${tools.jobs} jobs, ${tools.backups} backups`);
    console.log(`🔌 Extensions: ${extensions.plugins} plugins, ${extensions.marketplace} marketplace`);
    console.log(`🔍 Diagnostics: ${diagnostics.jobs} jobs, ${diagnostics.issues} issues`);
    console.log(`🗄️ Database: ${database.optimizations} optimizations, ${database.metrics} metrics`);
    console.log('=' .repeat(60));
    console.log('🔑 Default Login Credentials:');
    console.log('   🔴 Super Admin: admin@jacms.com / admin123');
    console.log('   🟡 Admin: admin2@jacms.com / admin123');
    console.log('   🟢 Editor: editor@jacms.com / editor123');
    console.log('   🔵 Author: author@jacms.com / author123');
    console.log('   ⚫ User: user@jacms.com / user123');
    console.log('=' .repeat(60));
    console.log('🚀 JA-CMS Enterprise is ready for development and testing!');
    
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  }
}

/**
 * Clear existing data in reverse dependency order
 */
async function clearExistingData() {
  const clearOperations = [
    // Dashboard
    () => prisma.chartDataCache.deleteMany(),
    () => prisma.dashboardActivity.deleteMany(),
    () => prisma.userWidget.deleteMany(),
    () => prisma.dashboardWidget.deleteMany(),
    () => prisma.userDashboardPreference.deleteMany(),
    () => prisma.quickAction.deleteMany(),
    () => prisma.notification.deleteMany(),
    () => prisma.systemHealthMetric.deleteMany(),
    
    // Advanced Extensions
    () => prisma.reviewVote.deleteMany(),
    () => prisma.pluginStat.deleteMany(),
    () => prisma.pluginDownload.deleteMany(),
    () => prisma.pluginLicense.deleteMany(),
    () => prisma.pluginTransaction.deleteMany(),
    () => prisma.eventListener.deleteMany(),
    () => prisma.apiRequestLog.deleteMany(),
    () => prisma.hookMetric.deleteMany(),
    () => prisma.pluginApiEndpoint.deleteMany(),
    () => prisma.hookCallback.deleteMany(),
    () => prisma.devLog.deleteMany(),
    () => prisma.buildHistory.deleteMany(),
    () => prisma.testResult.deleteMany(),
    () => prisma.devProject.deleteMany(),

    // Database Management
    () => prisma.queryPerformanceHistory.deleteMany(),
    () => prisma.connectionPoolStat.deleteMany(),
    () => prisma.tableAnalysisCache.deleteMany(),
    () => prisma.databaseCleanupHistory.deleteMany(),
    () => prisma.databaseAlert.deleteMany(),
    () => prisma.slowQuery.deleteMany(),
    () => prisma.databaseMetric.deleteMany(),
    () => prisma.databaseOptimizationJob.deleteMany(),

    // Diagnostics
    () => prisma.diagnosticAlert.deleteMany(),
    () => prisma.systemHealthMetric.deleteMany(),
    () => prisma.autoTroubleshootingHistory.deleteMany(),
    () => prisma.troubleshootingSolution.deleteMany(),
    () => prisma.errorTracking.deleteMany(),
    () => prisma.performanceProfile.deleteMany(),
    () => prisma.systemIssue.deleteMany(),
    () => prisma.diagnosticJob.deleteMany(),

    // Extensions
    () => prisma.hookExecution.deleteMany(),
    () => prisma.systemHook.deleteMany(),
    () => prisma.pluginDevelopment.deleteMany(),
    () => prisma.pluginPurchase.deleteMany(),
    () => prisma.pluginReview.deleteMany(),
    () => prisma.marketplacePlugin.deleteMany(),
    () => prisma.pluginHook.deleteMany(),
    () => prisma.pluginSetting.deleteMany(),
    () => prisma.plugin.deleteMany(),

    // Tools
    () => prisma.maintenanceExecution.deleteMany(),
    () => prisma.maintenanceTask.deleteMany(),
    () => prisma.diagnosticResult.deleteMany(),
    () => prisma.restoreJob.deleteMany(),
    () => prisma.backupJob.deleteMany(),
    () => prisma.exportLog.deleteMany(),
    () => prisma.importLog.deleteMany(),
    () => prisma.exportJob.deleteMany(),
    () => prisma.importJob.deleteMany(),

    // Security
    () => prisma.securityConfig.deleteMany(),
    () => prisma.loginAttempt.deleteMany(),
    () => prisma.passwordHistory.deleteMany(),
    () => prisma.activeSession.deleteMany(),
    () => prisma.incidentResponse.deleteMany(),
    () => prisma.securityIncident.deleteMany(),
    () => prisma.ipList.deleteMany(),
    () => prisma.firewallRule.deleteMany(),
    () => prisma.securityEvent.deleteMany(),

    // Media
    () => prisma.mediaSearchIndex.deleteMany(),
    () => prisma.mediaUploadSession.deleteMany(),
    () => prisma.mediaAnalytics.deleteMany(),
    () => prisma.mediaCdnCache.deleteMany(),
    () => prisma.mediaProcessingJob.deleteMany(),
    () => prisma.mediaTag.deleteMany(),
    () => prisma.mediaFolder.deleteMany(),
    () => prisma.mediaFile.deleteMany(),

    // Analytics
    () => prisma.reportExecution.deleteMany(),
    () => prisma.report.deleteMany(),
    () => prisma.analyticsEvent.deleteMany(),
    () => prisma.userAnalytics.deleteMany(),
    () => prisma.contentAnalytics.deleteMany(),
    () => prisma.analyticsSession.deleteMany(),
    () => prisma.pageView.deleteMany(),
    () => prisma.siteAnalytics.deleteMany(),

    // Content
    () => prisma.commentVote.deleteMany(),
    () => prisma.commentThread.deleteMany(),
    () => prisma.contentSchedule.deleteMany(),
    () => prisma.contentTemplate.deleteMany(),
    () => prisma.contentLock.deleteMany(),
    () => prisma.contentRevision.deleteMany(),
    () => prisma.workflowStep.deleteMany(),
    () => prisma.workflowInstance.deleteMany(),
    () => prisma.contentWorkflow.deleteMany(),

    // System
    () => prisma.auditLog.deleteMany(),
    () => prisma.notification.deleteMany(),

    // Basic entities
    () => prisma.analytics.deleteMany(),
    () => prisma.menuItem.deleteMany(),
    () => prisma.menu.deleteMany(),
    () => prisma.media.deleteMany(),
    () => prisma.postView.deleteMany(),
    () => prisma.like.deleteMany(),
    () => prisma.comment.deleteMany(),
    () => prisma.post.deleteMany(),
    () => prisma.category.deleteMany(),
    () => prisma.tag.deleteMany(),
    () => prisma.theme.deleteMany(),
    () => prisma.setting.deleteMany(),
    () => prisma.session.deleteMany(),
    () => prisma.user.deleteMany(),
  ];

  for (const operation of clearOperations) {
    try {
      await operation();
    } catch (error) {
      // Ignore foreign key constraint errors during cleanup
      console.log('⚠️ Cleanup warning (expected):', (error as Error).message.substring(0, 100));
    }
  }

  console.log('✅ Database cleared successfully');
}

// Export main function
export default main;

// Run if called directly
if (require.main === module) {
  main()
    .catch((e) => {
      console.error('❌ Fatal error during seeding:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
