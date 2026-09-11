// The August résumé supplies completed Hanlon dates; the technical CV adds project detail.
export const profile = {
  email: 'dyutighosh2@gmail.com',
  linkedin: 'https://www.linkedin.com/in/dyuti-ghosh/',
  github: '', // No GitHub URL was included in the supplied documents.
  resume: '/resume.pdf',
};

export const skills = ['Python', 'pandas · NumPy · scikit-learn', 'Java', 'C · C#', 'R', 'SQL', '.NET MAUI', 'Git', 'JUnit · Jenkins', 'Agile delivery', 'Stakeholder engagement'];

export const experience = [
  {
    company: 'Hanlon Industries', organisation: 'Jacaranda Flame Consulting',
    role: 'Engineering Consultant · Client Liaison', dates: 'Jun — Jul 2026',
    summary: 'Delivered digital solutions for production tracking and transport management, connecting operational needs with practical software improvements.',
    highlights: ['Owned a transport management workstream from requirements and prototyping through implementation, testing, and client handover.', 'Led weekly client workshops and translated stakeholder requirements into prioritised technical deliverables.', 'Developed .NET MAUI enhancements spanning workflow automation, barcode processing, and UI/UX.'],
  },
  {
    company: 'Baron Consulting Group Australia', organisation: 'Practera × University of Sydney',
    role: 'Industry Experience Consultant', dates: 'Mar — Apr 2026',
    summary: 'Worked in a multidisciplinary consulting team to develop an evidence-based strategic framework for a real client.',
    highlights: ['Built exploratory data analysis workflows in R and conducted market research to inform recommendations.', 'Communicated data-driven insights through technical reports and stakeholder presentations.'],
  },
  {
    company: 'Code Camp', organisation: 'After-school & holiday programs',
    role: 'Coding Instructor', dates: 'Oct 2024 — Present',
    summary: 'Teach programming through interactive game projects, adapting technical concepts to different ages and learning needs.',
    highlights: ['Guide classes of approximately 10 students from visual programming to text-based syntax.', 'Coach students through debugging and individual technical challenges to build confidence and independent problem-solving skills.'],
  },
];

export const projects = [
  { name: 'HanlonFab', category: 'ENGINEERING / CONSULTING', date: '2026', description: 'Production and transport workflow improvements for Hanlon Industries. Delivered a transport management workstream from client requirements through implementation, testing, and handover.', tags: ['.NET MAUI', 'C#', 'Agile'], visual: 'engineering', metric: 'End-to-end client delivery', url: '' },
  { name: 'Re:Fit', category: 'FULL-STACK / HACKATHON', date: 'Sep 2025', description: 'A wardrobe-sharing platform built in 24 hours at the COMM-STEM × Canva Hackathon, with item uploads, real-time messaging, and community forums.', tags: ['React', 'Python', 'Figma'], visual: 'refit', metric: 'Winner · Most Aesthetic Video Pitch', url: '' },
  { name: 'New York House Prices', category: 'DATA SCIENCE / MODELLING', date: 'Nov 2025', description: 'Regression and random forest models trained on 1,734 records. Combined preprocessing, feature engineering, AIC/BIC feature selection, and 10-fold cross-validation to investigate housing price drivers.', tags: ['R', 'Regression', 'Random forest'], visual: 'data', metric: 'R² ≈ 0.64 · 1,734 records', url: '' },
  { name: 'Virtual Scroll Access System', category: 'SOFTWARE / SYSTEMS', date: 'Nov 2025', description: 'A modular Java system with authentication, role-based access control, and CRUD operations. Developed in an Agile Scrum team across three sprints with automated tests and CI/CD.', tags: ['Java', 'JUnit', 'Jenkins'], visual: 'system', metric: '75%+ test coverage', url: '' },
  { name: 'Degree Curriculum Planner', category: 'SOFTWARE / EDUCATION', date: '', description: 'A software project centred on navigating degree requirements and planning an academic journey.', tags: ['Software engineering', 'Planning'], visual: 'planner', metric: '', url: '' },
  { name: 'MOCKOR', category: 'ARTIFICIAL INTELLIGENCE', date: '', description: 'An AI interviewer exploring how technology can support interview practice and preparation.', tags: ['AI', 'Interview practice'], visual: 'interview', metric: '', url: '' },
];

export const leadership = [
  { organisation: 'Engineers Australia', role: 'Student Ambassador', dates: 'Aug 2025 — Present', symbol: '↗', summary: 'Represent Engineers Australia at the University of Sydney, connecting students with professional development and industry opportunities.', impact: 'Represented Engineers Australia at 3+ major campus events and collaborated on outreach and campus marketing.' },
  { organisation: 'University of Sydney', role: 'Engineering Lead Mentor', dates: 'May 2025 — Present', symbol: '✳', summary: 'Selected as one of 18 Lead Mentors after serving as a Peer Mentor. Lead approximately 20 mentors supporting 150+ first-year engineering students.', impact: 'Helped coordinate faculty events and training for approximately 600 mentors and mentees.' },
  { organisation: 'Women in Technology · USYD', role: 'Treasurer', dates: 'Nov 2024 — Nov 2025', symbol: '↗', summary: 'Managed the society’s largest-ever budget for a community of 600+ members, including reimbursements, reconciliations, and financial reporting.', impact: 'Planned budgets for approximately 20 events and supported a fourfold increase in membership.' },
  { organisation: 'Girls Programming Network', role: 'Volunteer Tutor & Lecturer', dates: 'Mar 2025 — Present', symbol: '✳', summary: 'Deliver mini-lectures on computer science fundamentals for groups of approximately 30 students.', impact: 'Collaborate with fellow tutors to run full-day programming workshops and support student learning.' },
];

export const awards = [
  { name: 'Dalyell Scholar', detail: 'University of Sydney' },
  { name: 'Vice-Chancellor’s International Scholarship', detail: 'University of Sydney' },
  { name: 'Sydney International Student Award', detail: 'University of Sydney' },
  { name: 'Most Aesthetic Video Pitch', detail: 'Re:Fit · COMM-STEM × Canva Hackathon · 2025' },
];
