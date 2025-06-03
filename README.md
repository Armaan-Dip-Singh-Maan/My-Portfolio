Portfolio Website
A modern, responsive portfolio website built with Next.js and Tailwind CSS.

Features
🌙 Dark/Light mode toggle with localStorage persistence
📱 Fully responsive design (mobile-first approach)
⚡ Built with Next.js for optimal performance
🎨 Styled with Tailwind CSS
🔗 Social media integration
📝 Blog carousel section
💼 Projects showcase with hover effects
📧 Contact information display
Getting Started
Prerequisites
Node.js 16.x or later
npm or yarn package manager
Installation
Clone or download the project files
Navigate to the project directory
Install dependencies:
bash
npm install

# or

yarn install
Run the development server:
bash
npm run dev

# or

yarn dev
Open http://localhost:3000 in your browser
Project Structure
my-portfolio/
├── components/
│ ├── Header.js # Main header with name and CTA buttons
│ ├── SkillsCard.js # Skills section with technology tags
│ ├── ConnectCard.js # Social media links and contact info
│ ├── BlogCarousel.js # Blog posts carousel
│ ├── ExperienceItem.js # Work experience section
│ ├── ProjectCard.js # Project cards and grid
│ ├── Footer.js # Footer with copyright
│ └── DarkToggle.js # Dark/light mode toggle
├── pages/
│ ├── \_app.js # App wrapper with dark mode state
│ └── index.js # Main homepage
├── styles/
│ └── globals.css # Global styles and Tailwind imports
├── tailwind.config.js # Tailwind configuration
├── next.config.js # Next.js configuration
├── postcss.config.js # PostCSS configuration
└── package.json # Dependencies and scripts
Customization
Personal Information
To customize the portfolio with your own information:

Header (components/Header.js):
Change "Aasu Yadav" to your name
Update the description text
Modify button actions
Skills (components/SkillsCard.js):
Update the skills array with your technologies
Contact (components/ConnectCard.js):
Update social media links in socialLinks array
Change email and address information
Experience (components/ExperienceItem.js):
Update company name, position, and dates
Add more experience items as needed
Projects (components/ProjectCard.js):
Update the projects array with your own projects
Add real project URLs and images
Footer (components/Footer.js):
Update copyright name
Styling
The project uses Tailwind CSS for styling. Key color scheme:

Dark mode:
Background:
#111111
Cards:
#1a1a1a,
#2a2a2a
Text:
#ffffff,
#bbbbbb,
#777777
Light mode:
Background:
#fafafa
Text:
#333333
Adding New Sections
To add new sections:

Create a new component in the components/ directory
Import and add it to pages/index.js
Follow the existing styling patterns for consistency
Deployment
Vercel (Recommended)
Push your code to a Git repository
Import your project to Vercel
Deploy with zero configuration
Other Platforms
Build the project:

bash
npm run build
npm run start
The built files will be in the .next directory.

Technologies Used
Next.js - React framework for production
React - JavaScript library for building user interfaces
Tailwind CSS - Utility-first CSS framework
PostCSS - CSS post-processor
Keen Slider - Lightweight carousel library
License
This project is open source and available under the MIT License.

Contributing
Feel free to submit issues and enhancement requests!

Support
If you need help with setup or customization, please create an issue in the repository.
