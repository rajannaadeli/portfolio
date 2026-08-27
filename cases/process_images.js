const fs = require('fs');
const path = require('path');

const casesDir = '/Users/rajeshadeli/Desktop/portfolio/cases';
const cases = ['docfort', 'rosterbay', 'whitefleet'];

const generateDescription = (slug, caseName) => {
    let desc = "Detailed view of the " + slug.replace(/-/g, ' ') + " feature.";
    let tags = [slug.replace(/-/g, ' ')];
    let alt = slug.replace(/-/g, ' ') + " screen";
    let isMobile = slug.includes('mobile');
    let use = isMobile ? "mobile-showcase" : "detail-shot";
    
    if (slug.includes('home') || slug.includes('dashboard')) {
        desc = `The primary ${isMobile ? 'mobile ' : ''}overview interface showing high-level metrics and data density with polished visual hierarchy.`;
        use = "hero";
        tags.push('dashboard', 'overview');
    } else if (slug.includes('roster-day') || slug.includes('roster-week')) {
        desc = `Bespoke scheduling UI demonstrating time-as-space thinking. Shifts are drawn proportionally on a time axis.`;
        use = "feature-highlight";
        tags.push('roster', 'scheduling', 'grid');
    } else if (slug.includes('map') || slug.includes('live')) {
        desc = `Real-time map view tracking assets or personnel, emphasizing complex data visualization and clear UI states.`;
        use = "feature-highlight";
        tags.push('map', 'tracking');
    } else if (slug.includes('upload') || slug.includes('create')) {
        desc = `Streamlined data entry flow with clear focus states and validation, highlighting attention to product thinking and user friction reduction.`;
        use = "detail-shot";
        tags.push('form', 'entry');
    } else if (slug.includes('profile') || slug.includes('team')) {
        desc = `User and team management interface with clean, structured bento-style layouts for personal data.`;
        tags.push('management', 'users');
    }
    
    if (isMobile) {
        desc += " Optimized for mobile viewports.";
    }
    
    return { desc, alt, tags, use };
};

for (const caseName of cases) {
    const uiDir = path.join(casesDir, caseName, 'ui');
    if (!fs.existsSync(uiDir)) continue;
    
    const files = fs.readdirSync(uiDir);
    const avifs = files.filter(f => f.endsWith('.avif'));
    
    const imagesList = [];
    let rank = 1;
    
    for (const avif of avifs) {
        const base = avif.replace('.avif', '');
        const webp = base + '.webp';
        
        if (files.includes(webp)) {
            // e.g. docfort-01-home
            let newBase = base.replace(new RegExp('^' + caseName + '-'), '');
            // check if it starts with digits
            let slug = newBase;
            const match = newBase.match(/^(\d+)-(.*)$/);
            if (match) {
                // If it already has numbers, we can just use the slug part or keep the rank 
                slug = match[2];
            } else {
                // If no numbers, let's just use the whole as slug
                slug = newBase;
            }
            
            let rankStr = rank.toString().padStart(2, '0');
            let finalBase = `${rankStr}-${slug}`;
            
            // Rename files
            const oldAvifPath = path.join(uiDir, avif);
            const oldWebpPath = path.join(uiDir, webp);
            const newAvifPath = path.join(uiDir, finalBase + '.avif');
            const newWebpPath = path.join(uiDir, finalBase + '.webp');
            
            fs.renameSync(oldAvifPath, newAvifPath);
            fs.renameSync(oldWebpPath, newWebpPath);
            
            const meta = generateDescription(slug, caseName);
            const isShortlisted = rank <= 6; // top 6
            
            imagesList.push({
                fileNameBase: finalBase,
                formats: {
                    avif: finalBase + '.avif',
                    webp: finalBase + '.webp'
                },
                rank: rank,
                isShortlisted: isShortlisted,
                description: meta.desc,
                altText: meta.alt,
                tags: meta.tags,
                suggestedUse: meta.use
            });
            
            rank++;
        }
    }
    
    const jsonPath = path.join(casesDir, caseName, 'case-images.json');
    const outData = {
        case: caseName,
        totalImages: imagesList.length,
        shortlistedCount: imagesList.filter(i => i.isShortlisted).length,
        images: imagesList
    };
    
    fs.writeFileSync(jsonPath, JSON.stringify(outData, null, 2));
    console.log(`Processed ${caseName}: ${imagesList.length} images`);
}
