const fs = require('fs');
const path = require('path');

const casesDir = '/Users/rajeshadeli/Desktop/portfolio/cases';

const metadataMap = {
  'docfort': [
    { file: '01-home', rank: 1, isShortlisted: true, altText: 'Dashboard overview', tags: ['dashboard', 'hero'], suggestedUse: 'hero', description: 'The primary overview interface showing structured bento-style cards for technical documents and recent updates, featuring a clean true-black canvas and pink accents.' },
    { file: '02-create-drawing', rank: 2, isShortlisted: true, altText: 'Create drawing modal', tags: ['modal', 'form', 'data-entry'], suggestedUse: 'detail-shot', description: 'Streamlined data entry flow with clear focus states and validation, highlighting attention to product thinking and user friction reduction during document creation.' },
    { file: '08-drawing-list', rank: 3, isShortlisted: true, altText: 'Drawing list table', tags: ['table', 'data-density', 'filters'], suggestedUse: 'feature-highlight', description: 'High data density table view demonstrating robust filtering and status tracking for engineering drawings.' },
    { file: '06-drawing-details', rank: 4, isShortlisted: true, altText: 'Drawing details view', tags: ['metadata', 'details', 'history'], suggestedUse: 'detail-shot', description: 'Detailed view of a drawing showcasing structured metadata layout and clear revision history tracking.' },
    { file: '11-preferences-dark', rank: 5, isShortlisted: true, altText: 'Dark mode preferences', tags: ['settings', 'dark-mode'], suggestedUse: 'detail-shot', description: 'Preferences interface displaying theme controls and demonstrating the polished dark mode execution.' },
    { file: '13-admin', rank: 6, isShortlisted: true, altText: 'Admin dashboard', tags: ['admin', 'users', 'management'], suggestedUse: 'detail-shot', description: 'Admin dashboard managing departmental submissions and users, showing totals and a clear list of active accounts.' },
    { file: '09-global-search', rank: 7, isShortlisted: false, altText: 'Global search palette', tags: ['search', 'command-palette'], suggestedUse: 'detail-shot', description: 'Global command palette interface for quick navigation across the platform, emphasizing speed.' },
    { file: '07-upload-revision', rank: 8, isShortlisted: false, altText: 'Upload revision modal', tags: ['modal', 'upload'], suggestedUse: 'detail-shot', description: 'Modal interface for uploading drawing revisions and updating version metadata.' },
    { file: '03-create-complete', rank: 9, isShortlisted: false, altText: 'Upload success state', tags: ['state', 'success'], suggestedUse: 'detail-shot', description: 'Success state UI after uploading a file, showing clear confirmation messaging.' },
    { file: '14-bulk-upload', rank: 10, isShortlisted: false, altText: 'Bulk upload interface', tags: ['upload', 'bulk'], suggestedUse: 'detail-shot', description: 'Bulk upload interface featuring drag-and-drop functionality and clear user instructions.' },
    { file: '15-bulk-upload-results', rank: 11, isShortlisted: false, altText: 'Bulk upload results', tags: ['upload', 'results', 'stats'], suggestedUse: 'detail-shot', description: 'Statistical breakdown of bulk upload results, showing completion rates and missing files.' },
    { file: '12-profile', rank: 12, isShortlisted: false, altText: 'User profile', tags: ['profile', 'settings'], suggestedUse: 'detail-shot', description: 'User profile page showing personal and professional details in a clean card layout.' },
    { file: '10-preferences', rank: 13, isShortlisted: false, altText: 'Light mode preferences', tags: ['settings', 'light-mode'], suggestedUse: 'detail-shot', description: 'Preferences interface displaying theme controls in light mode.' },
    { file: '05-notify-navigation', rank: 14, isShortlisted: false, altText: 'Notifications dropdown', tags: ['notifications', 'dropdown'], suggestedUse: 'detail-shot', description: 'Notifications dropdown menu showing recent alerts and action requirements.' },
    { file: '04-notify', rank: 15, isShortlisted: false, altText: 'Notification toast', tags: ['notifications', 'toast'], suggestedUse: 'detail-shot', description: 'Transient notification toast alerting the user of a successful drawing creation.' }
  ],
  'rosterbay': [
    { file: '03-roster-day', rank: 1, isShortlisted: true, altText: 'Daily roster timeline', tags: ['roster', 'timeline', 'scheduling'], suggestedUse: 'hero', description: 'Bespoke scheduling UI demonstrating time-as-space thinking. Shifts are drawn proportionally on a detailed daily time axis, highlighting complex data visualization.' },
    { file: '02-dashboard', rank: 2, isShortlisted: true, altText: 'Dashboard map and alerts', tags: ['dashboard', 'map', 'alerts'], suggestedUse: 'feature-highlight', description: 'The primary overview interface showing a live map of all sites, high-level metrics, and a feed of items needing attention.' },
    { file: '07-timesheets', rank: 3, isShortlisted: true, altText: 'Timesheet verification', tags: ['timesheets', 'map', 'verification'], suggestedUse: 'feature-highlight', description: 'Detailed timesheet view with map verification, flagging variances like late clock-ins to ensure workforce compliance.' },
    { file: '12-mobile-home', rank: 4, isShortlisted: true, altText: 'Mobile home screen', tags: ['mobile', 'home', 'shift'], suggestedUse: 'mobile-showcase', description: 'The primary mobile interface showing the worker\'s next scheduled shift and distance to site. Optimized for mobile viewports.' },
    { file: '08-job-sites', rank: 5, isShortlisted: true, altText: 'Job sites grid', tags: ['sites', 'grid', 'maps'], suggestedUse: 'detail-shot', description: 'Job sites grid view featuring mini-map thumbnails and compliance tracking for each location.' },
    { file: '04-roster-week', rank: 6, isShortlisted: true, altText: 'Weekly roster grid', tags: ['roster', 'week', 'scheduling'], suggestedUse: 'feature-highlight', description: 'Weekly view of the scheduling roster showing data density and coverage across multiple sites and days.' },
    { file: '09-job-details', rank: 7, isShortlisted: false, altText: 'Job site geofence setup', tags: ['site', 'map', 'geofence'], suggestedUse: 'detail-shot', description: 'Job site details view showcasing an interactive map with a geofence radius adjustment slider.' },
    { file: '06-workers', rank: 8, isShortlisted: false, altText: 'Workers list', tags: ['workers', 'compliance', 'list'], suggestedUse: 'detail-shot', description: 'Comprehensive workers list showing compliance status, expiring certificates, and weekly shift counts.' },
    { file: '14-wallet', rank: 9, isShortlisted: false, altText: 'Mobile wallet', tags: ['mobile', 'wallet', 'compliance'], suggestedUse: 'mobile-showcase', description: 'Mobile app wallet view displaying the worker\'s compliance documents and their validity status.' },
    { file: '05-tasks', rank: 10, isShortlisted: false, altText: 'Shift tasks list', tags: ['tasks', 'shift'], suggestedUse: 'detail-shot', description: 'Job sites view focusing on a specific site and displaying the required task checklist for a shift.' },
    { file: '16-mobile-schedule', rank: 11, isShortlisted: false, altText: 'Mobile schedule', tags: ['mobile', 'schedule'], suggestedUse: 'mobile-showcase', description: 'Mobile app schedule tab outlining upcoming shifts for this week and next week.' },
    { file: '13-mobile-shift-details', rank: 12, isShortlisted: false, altText: 'Mobile shift tasks', tags: ['mobile', 'shift', 'tasks'], suggestedUse: 'mobile-showcase', description: 'Mobile app shift details screen showing a comprehensive list of tasks to be completed.' },
    { file: '15-mobile-tasks', rank: 13, isShortlisted: false, altText: 'Mobile active shift timer', tags: ['mobile', 'timer', 'tasks'], suggestedUse: 'mobile-showcase', description: 'Mobile app view during an active shift, featuring a live timer and the task checklist.' },
    { file: '11-mobile-document', rank: 14, isShortlisted: false, altText: 'Mobile add document', tags: ['mobile', 'upload', 'document'], suggestedUse: 'mobile-showcase', description: 'Mobile app interface for adding a new compliance document, with fields for dates and photo capture.' },
    { file: '01-entry', rank: 15, isShortlisted: false, altText: 'Landing page', tags: ['landing', 'marketing'], suggestedUse: 'hero', description: 'Landing page introducing the platform\'s value proposition and showing a mockup of the interface.' },
    { file: '10-global-search', rank: 16, isShortlisted: false, altText: 'Global search overlay', tags: ['search', 'overlay'], suggestedUse: 'detail-shot', description: 'Global search modal overlay providing quick navigation across the platform.' }
  ],
  'whitefleet': [
    { file: '03-live-map', rank: 1, isShortlisted: true, altText: 'Live tracking map', tags: ['map', 'tracking', 'live'], suggestedUse: 'hero', description: 'Real-time map view tracking assets and personnel across geofences, emphasizing complex data visualization and clear UI states.' },
    { file: '04-tasks', rank: 2, isShortlisted: true, altText: 'Tasks Kanban board', tags: ['tasks', 'kanban', 'management'], suggestedUse: 'feature-highlight', description: 'Kanban board for task management showing clear state progression (To Do, In Progress, Done, Verified) and visual hierarchy.' },
    { file: '01-dashboard', rank: 3, isShortlisted: true, altText: 'Dashboard overview', tags: ['dashboard', 'metrics', 'charts'], suggestedUse: 'hero', description: 'The primary overview interface showing high-level metrics, activity charts, and recent employees in a clean card layout.' },
    { file: '16-mobile-task-awaiting', rank: 4, isShortlisted: true, altText: 'Mobile task verification', tags: ['mobile', 'task', 'verification'], suggestedUse: 'mobile-showcase', description: 'Mobile app task details screen showing submitted photo evidence and awaiting verification status. Optimized for mobile viewports.' },
    { file: '07-admin-dashboard', rank: 5, isShortlisted: true, altText: 'Platform admin dashboard', tags: ['admin', 'multi-tenant', 'metrics'], suggestedUse: 'detail-shot', description: 'Multi-tenant admin dashboard showing platform-wide metrics, company registrations, and active subscriptions.' },
    { file: '02-my-team', rank: 6, isShortlisted: true, altText: 'Team management list', tags: ['team', 'management', 'list'], suggestedUse: 'detail-shot', description: 'Team management interface displaying members\' clock status, active tasks, and compliance badges.' },
    { file: '08-audit-logs', rank: 7, isShortlisted: false, altText: 'Audit log table', tags: ['audit', 'logs', 'table'], suggestedUse: 'detail-shot', description: 'Detailed audit log table tracking granular platform actions, resources, and actors for security and compliance.' },
    { file: '05-all-employees', rank: 8, isShortlisted: false, altText: 'Employee directory', tags: ['employees', 'directory', 'list'], suggestedUse: 'detail-shot', description: 'Comprehensive employee directory showing roles, status, departments, and join dates.' },
    { file: '10-mobile-home', rank: 9, isShortlisted: false, altText: 'Mobile active shift', tags: ['mobile', 'home', 'shift'], suggestedUse: 'mobile-showcase', description: 'Mobile app home screen indicating an active shift with a prominent "On the clock" status.' },
    { file: '14-mobile-task-details', rank: 10, isShortlisted: false, altText: 'Mobile task details', tags: ['mobile', 'task', 'details'], suggestedUse: 'mobile-showcase', description: 'Mobile task details screen outlining status, priority, and specific completion requirements.' },
    { file: '15-mobile-task-proof', rank: 11, isShortlisted: false, altText: 'Mobile task photo upload', tags: ['mobile', 'task', 'upload'], suggestedUse: 'mobile-showcase', description: 'Mobile interface for uploading photo evidence to fulfill task completion requirements.' },
    { file: '09-platform-documents', rank: 12, isShortlisted: false, altText: 'Compliance documents list', tags: ['documents', 'compliance', 'templates'], suggestedUse: 'detail-shot', description: 'Platform-wide compliance and induction document templates library.' },
    { file: '13-mobile-tasks', rank: 13, isShortlisted: false, altText: 'Mobile overdue task', tags: ['mobile', 'tasks', 'overdue'], suggestedUse: 'mobile-showcase', description: 'Mobile app tasks list highlighting an overdue task for immediate attention.' },
    { file: '12-mobile-notifications', rank: 14, isShortlisted: false, altText: 'Mobile notifications', tags: ['mobile', 'notifications'], suggestedUse: 'mobile-showcase', description: 'Mobile app notifications feed alerting the user to task updates and assignments.' },
    { file: '11-mobile-profile', rank: 15, isShortlisted: false, altText: 'Mobile settings', tags: ['mobile', 'settings', 'theme'], suggestedUse: 'mobile-showcase', description: 'Mobile app settings screen featuring account management and theme controls.' },
    { file: '06-global-search', rank: 16, isShortlisted: false, altText: 'Global navigation search', tags: ['search', 'navigation'], suggestedUse: 'detail-shot', description: 'Global search and navigation overlay for quick access to platform sections.' }
  ]
};

for (const caseName of Object.keys(metadataMap)) {
    const imagesList = [];
    const metaArr = metadataMap[caseName];
    
    // Validate that we have the exact number of images
    const uiDir = path.join(casesDir, caseName, 'ui');
    const files = fs.readdirSync(uiDir);
    const avifs = files.filter(f => f.endsWith('.avif'));
    
    // Sort metaArr by rank
    metaArr.sort((a, b) => a.rank - b.rank);
    
    // We will rename the files to match the new ranks
    // To avoid conflicts during renaming (e.g. renaming 02 to 01 when 01 exists),
    // we'll first rename everything to a temp name, then to the final name.
    
    for (const meta of metaArr) {
        // Find existing files for this slug
        // The current files might be named something like "01-home.avif"
        // Let's find the file that ends with `-${meta.file}.avif` or matches exactly.
        const existingAvif = avifs.find(f => f.includes(meta.file));
        if (!existingAvif) {
            console.error(`Could not find file for ${meta.file} in ${caseName}`);
            continue;
        }
        
        const existingBase = existingAvif.replace('.avif', '');
        
        let rankStr = meta.rank.toString().padStart(2, '0');
        let finalBase = `${rankStr}-${meta.file}`;
        
        // temp rename
        const tempAvif = path.join(uiDir, `TEMP_${finalBase}.avif`);
        const tempWebp = path.join(uiDir, `TEMP_${finalBase}.webp`);
        fs.renameSync(path.join(uiDir, existingAvif), tempAvif);
        fs.renameSync(path.join(uiDir, existingBase + '.webp'), tempWebp);
        
        // Save mapping for final rename
        meta.tempAvif = tempAvif;
        meta.tempWebp = tempWebp;
        meta.finalBase = finalBase;
    }
    
    // Final rename and JSON build
    for (const meta of metaArr) {
        const finalAvif = path.join(uiDir, meta.finalBase + '.avif');
        const finalWebp = path.join(uiDir, meta.finalBase + '.webp');
        
        if (meta.tempAvif && fs.existsSync(meta.tempAvif)) {
            fs.renameSync(meta.tempAvif, finalAvif);
            fs.renameSync(meta.tempWebp, finalWebp);
        }
        
        imagesList.push({
            fileNameBase: meta.finalBase,
            formats: {
                avif: meta.finalBase + '.avif',
                webp: meta.finalBase + '.webp'
            },
            rank: meta.rank,
            isShortlisted: meta.isShortlisted,
            description: meta.description,
            altText: meta.altText,
            tags: meta.tags,
            suggestedUse: meta.suggestedUse
        });
    }
    
    const jsonPath = path.join(casesDir, caseName, 'case-images.json');
    const outData = {
        case: caseName,
        totalImages: imagesList.length,
        shortlistedCount: imagesList.filter(i => i.isShortlisted).length,
        images: imagesList
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(outData, null, 2));
    console.log(`Processed ${caseName} with VISUAL ANALYSIS: ${imagesList.length} images`);
}
