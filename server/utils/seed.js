require("dotenv").config({ path: __dirname + "/../.env" });
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../Models/user");
const Skill = require("../Models/skill");
const Review = require("../Models/review");
const SwapRequest = require("../Models/swaprequest");

const sampleUsers = [
  {
    name: "Elena Rostova",
    email: "elena@skillswap.io",
    password: "password123",
    headline: "Senior UI/UX Designer & Design Systems Specialist",
    bio: "Passionate about Figma, design tokens, micro-interactions, and accessible typography. Looking to learn backend development and Python.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
    location: "Stockholm, Sweden",
    timezone: "CET (UTC+1)",
    contactInfo: {
      email: "elena@skillswap.io",
      discord: "elena_design#4412",
      linkedin: "linkedin.com/in/elena-rostova",
    },
    skillsOffered: ["UI/UX Design in Figma", "Design Systems Architecture"],
    skillsNeeded: ["Python Basics", "Node.js & Express"],
    ratingAverage: 4.9,
    ratingCount: 14,
    completedSwapsCount: 16,
  },
  {
    name: "Marcus Vance",
    email: "marcus@skillswap.io",
    password: "password123",
    headline: "Full-Stack Engineer (Node.js, React, Docker)",
    bio: "10 years building high-scale web apps and microservices. Wanting to learn conversational Spanish and photography editing in Lightroom.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    location: "Austin, Texas",
    timezone: "CST (UTC-6)",
    contactInfo: {
      email: "marcus@skillswap.io",
      github: "github.com/marcusvance",
      discord: "marcus_dev#8891",
    },
    skillsOffered: ["Node.js & Express", "React & Modern Web Apps", "Docker & DevOps"],
    skillsNeeded: ["Conversational Spanish", "UI/UX Design in Figma"],
    ratingAverage: 4.8,
    ratingCount: 22,
    completedSwapsCount: 25,
  },
  {
    name: "Sofia Morales",
    email: "sofia@skillswap.io",
    password: "password123",
    headline: "Native Spanish Speaker & Language Coach",
    bio: "Certified bilingual tutor with 5+ years teaching conversational Spanish, idioms, and business Latin American Spanish. Eager to master Digital Marketing and SEO.",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    location: "Barcelona, Spain",
    timezone: "CET (UTC+1)",
    contactInfo: {
      email: "sofia@skillswap.io",
      calendly: "calendly.com/sofia-spanish",
    },
    skillsOffered: ["Conversational Spanish", "Latin American Spanish"],
    skillsNeeded: ["Digital Marketing & SEO", "React & Modern Web Apps"],
    ratingAverage: 5.0,
    ratingCount: 19,
    completedSwapsCount: 21,
  },
  {
    name: "David Chen",
    email: "david@skillswap.io",
    password: "password123",
    headline: "Growth Marketer & Performance SEO Consultant",
    bio: "Helped 30+ startups grow organic traffic from zero to 100k visitors/mo. In exchange, I want to learn fingerstyle acoustic guitar and cooking authentic pasta.",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    location: "Toronto, Canada",
    timezone: "EST (UTC-5)",
    contactInfo: {
      email: "david@skillswap.io",
      linkedin: "linkedin.com/in/davidchengrowth",
    },
    skillsOffered: ["Digital Marketing & SEO", "Content Strategy"],
    skillsNeeded: ["Acoustic Guitar Basics", "Design Systems Architecture"],
    ratingAverage: 4.7,
    ratingCount: 9,
    completedSwapsCount: 11,
  },
  {
    name: "Chloe Martin",
    email: "chloe@skillswap.io",
    password: "password123",
    headline: "Professional Guitarist & Songwriter",
    bio: "Touring musician and guitar teacher for over 7 years. Specializing in fingerstyle, chords, rhythm, and song composition. Seeking help with Machine Learning and Python.",
    avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
    location: "London, UK",
    timezone: "GMT (UTC+0)",
    contactInfo: {
      email: "chloe@skillswap.io",
      discord: "chloeguitar#1209",
    },
    skillsOffered: ["Acoustic Guitar Basics", "Music Theory & Songwriting"],
    skillsNeeded: ["Python Basics", "Conversational Spanish"],
    ratingAverage: 4.9,
    ratingCount: 18,
    completedSwapsCount: 20,
  },
  {
    name: "Aarav Patel",
    email: "aarav@skillswap.io",
    password: "password123",
    headline: "Data Scientist & Machine Learning Engineer",
    bio: "Working with PyTorch, pandas, and data pipelines. Happy to teach Python for data analysis, scraping, and introductory ML. Want to learn UI/UX design.",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=80",
    location: "Bengaluru, India",
    timezone: "IST (UTC+5:30)",
    contactInfo: {
      email: "aarav@skillswap.io",
      github: "github.com/aaravpatel",
    },
    skillsOffered: ["Python Basics", "Data Analysis & pandas"],
    skillsNeeded: ["UI/UX Design in Figma", "Acoustic Guitar Basics"],
    ratingAverage: 4.8,
    ratingCount: 12,
    completedSwapsCount: 15,
  },
];

const sampleSkills = [
  {
    userEmail: "elena@skillswap.io",
    title: "UI/UX Design in Figma",
    description: "Learn how to build wireframes, interactive prototypes, auto-layouts, and component libraries in Figma from scratch.",
    category: "Design & Creative",
    level: "Advanced",
    tags: ["Figma", "UI Design", "Prototyping", "Design Systems"],
  },
  {
    userEmail: "elena@skillswap.io",
    title: "Design Systems Architecture",
    description: "Deep dive into typography hierarchy, color tokens, semantic spacing, and organizing scalable component kits for web apps.",
    category: "Design & Creative",
    level: "Expert",
    tags: ["Design Systems", "Tokens", "Figma", "UI/UX"],
  },
  {
    userEmail: "marcus@skillswap.io",
    title: "Node.js & Express",
    description: "Hands-on guidance for building clean RESTful APIs, JWT auth middlewares, MongoDB schemas, and best backend practices.",
    category: "Development & IT",
    level: "Expert",
    tags: ["Node.js", "Express", "REST API", "Backend"],
  },
  {
    userEmail: "marcus@skillswap.io",
    title: "React & Modern Web Apps",
    description: "Master React state management, hooks, custom hooks, Tailwind CSS integration, and client-side routing with Vite.",
    category: "Development & IT",
    level: "Advanced",
    tags: ["React", "JavaScript", "Frontend", "TailwindCSS"],
  },
  {
    userEmail: "marcus@skillswap.io",
    title: "Docker & DevOps",
    description: "Learn how to containerize frontend and backend applications, write Dockerfiles and docker-compose files for local development.",
    category: "Development & IT",
    level: "Intermediate",
    tags: ["Docker", "DevOps", "Containers"],
  },
  {
    userEmail: "sofia@skillswap.io",
    title: "Conversational Spanish",
    description: "Practical conversational practice for beginners or intermediates. Real-world dialogue, pronunciation, and useful everyday vocabulary.",
    category: "Languages",
    level: "Beginner",
    tags: ["Spanish", "Language", "Conversation", "Pronunciation"],
  },
  {
    userEmail: "sofia@skillswap.io",
    title: "Latin American Spanish",
    description: "Explore cultural nuances, local idioms, and professional Spanish communication for travelers and remote team workers.",
    category: "Languages",
    level: "Intermediate",
    tags: ["Spanish", "Latin America", "Culture"],
  },
  {
    userEmail: "david@skillswap.io",
    title: "Digital Marketing & SEO",
    description: "Keyword research, technical SEO audits, content clustering, and on-page optimization strategies to rank on Google search.",
    category: "Marketing & Business",
    level: "Advanced",
    tags: ["SEO", "Marketing", "Google Search", "Growth"],
  },
  {
    userEmail: "david@skillswap.io",
    title: "Content Strategy",
    description: "Create content funnels that attract, engage, and convert readers through newsletters, blogs, and LinkedIn thought leadership.",
    category: "Marketing & Business",
    level: "Intermediate",
    tags: ["Content", "Copywriting", "Strategy"],
  },
  {
    userEmail: "chloe@skillswap.io",
    title: "Acoustic Guitar Basics",
    description: "Learn chord transitions, rhythm strumming patterns, finger dexterity exercises, and playing your favorite songs in 4 weeks.",
    category: "Music & Audio",
    level: "Beginner",
    tags: ["Guitar", "Music", "Acoustic", "Chords"],
  },
  {
    userEmail: "chloe@skillswap.io",
    title: "Music Theory & Songwriting",
    description: "Understand the circle of fifths, scale harmonization, chord progressions, and how to write memorable melodies.",
    category: "Music & Audio",
    level: "Intermediate",
    tags: ["Music Theory", "Songwriting", "Composition"],
  },
  {
    userEmail: "aarav@skillswap.io",
    title: "Python Basics",
    description: "Get comfortable with Python fundamentals: syntax, data structures, loops, functions, file I/O, and writing automated utility scripts.",
    category: "Development & IT",
    level: "Beginner",
    tags: ["Python", "Coding", "Automation"],
  },
  {
    userEmail: "aarav@skillswap.io",
    title: "Data Analysis & pandas",
    description: "Clean messy tabular data, compute summary statistics, merge dataframes, and generate visualizations with pandas & matplotlib.",
    category: "Development & IT",
    level: "Intermediate",
    tags: ["Data Science", "pandas", "Python", "Data Analysis"],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/skill-swap");
    console.log("Connected to MongoDB for seeding...");

    // Keep Somil's account if it exists, or update it
    const somil = await User.findOne({ email: "somilagrawal2004@gmail.com" });
    if (somil) {
      somil.skillsOffered = ["Full-Stack Development", "React & Node.js"];
      somil.skillsNeeded = ["UI/UX Design in Figma", "Digital Marketing & SEO"];
      somil.headline = "Software Developer & Skill-Swap Creator";
      somil.bio = "Building community-driven software. Eager to swap coding mentorship for design and marketing expertise!";
      somil.avatar = somil.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=Somil";
      somil.role = "admin";
      await somil.save();
      console.log("Updated Somil's profile with offered and needed skills + admin privileges.");
    }

    // Seed or update master Administrator account
    let adminUser = await User.findOne({ email: "admin@skillswap.io" });
    if (!adminUser) {
      const hashedAdminPass = await bcrypt.hash("admin123", 10);
      adminUser = new User({
        name: "SkillSwap Administrator",
        email: "admin@skillswap.io",
        password: hashedAdminPass,
        role: "admin",
        headline: "Platform Administrator & Operations Lead",
        bio: "Managing platform liquidity, trust & safety, and system health.",
        avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Admin",
        credits: 999,
      });
      await adminUser.save();
      console.log("Created master Admin user: admin@skillswap.io / admin123");
    } else {
      adminUser.role = "admin";
      await adminUser.save();
      console.log("Ensured admin role on admin@skillswap.io");
    }

    // Seed or update sample users
    const userMap = new Map();
    for (const u of sampleUsers) {
      let existing = await User.findOne({ email: u.email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        existing = new User({ ...u, password: hashedPassword });
        await existing.save();
        console.log(`Created user ${u.name}`);
      } else {
        const hashedPassword = await bcrypt.hash(u.password, 10);
        Object.assign(existing, u);
        existing.password = hashedPassword;
        await existing.save();
        console.log(`Updated user ${u.name} (hashed password)`);
      }
      userMap.set(u.email, existing);
    }

    // Seed skills
    for (const s of sampleSkills) {
      const user = userMap.get(s.userEmail);
      if (!user) continue;

      const existingSkill = await Skill.findOne({ title: s.title, userId: user._id });
      if (!existingSkill) {
        await Skill.create({
          title: s.title,
          description: s.description,
          category: s.category,
          level: s.level,
          tags: s.tags,
          userId: user._id,
        });
        console.log(`Created skill: ${s.title}`);
      }
    }

    // Add Somil's skill if he exists
    if (somil) {
      const existingSomilSkill = await Skill.findOne({ title: "Full-Stack Development", userId: somil._id });
      if (!existingSomilSkill) {
        await Skill.create({
          title: "Full-Stack Development",
          description: "MERN Stack architectural development, REST APIs, and modern frontend application development.",
          category: "Development & IT",
          level: "Advanced",
          tags: ["MERN", "React", "Node.js", "Express"],
          userId: somil._id,
        });
        console.log("Added Somil's skill: Full-Stack Development");
      }
    }

    console.log("Seeding completed successfully!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
