
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const services = [
    {
      id: 'vercel',
      name: 'Vercel',
      category: 'Deployment',
      description: 'A cloud platform for static sites and Serverless Functions that fits perfectly with Next.js.',
      pricing: 'Free tier available, Pro plan from $20/user/month',
      url: 'https://vercel.com',
      connections: ['supabase', 'planetscale', 'github-actions'],
    },
    {
      id: 'netlify',
      name: 'Netlify',
      category: 'Deployment',
      description: 'An all-in-one platform for automating modern web projects. Build, deploy, and manage sites and apps.',
      pricing: 'Free tier available, Pro plan from $19/user/month',
      url: 'https://www.netlify.com',
      connections: ['supabase', 'firebase', 'github-actions'],
    },
    {
      id: 'supabase',
      name: 'Supabase',
      category: 'DB',
      description: 'The open source Firebase alternative. Instantly build a backend with a Postgres database, authentication, and more.',
      pricing: 'Free tier available, Pro plan from $25/month',
      url: 'https://supabase.com',
      connections: ['vercel', 'netlify'],
    },
    {
      id: 'firebase',
      name: 'Firebase',
      category: 'DB',
      description: 'A comprehensive app development platform by Google. Includes a NoSQL database, authentication, and hosting.',
      pricing: 'Free tier (Spark Plan), Pay-as-you-go (Blaze Plan)',
      url: 'https://firebase.google.com',
      connections: ['netlify'],
    },
    {
      id: 'planetscale',
      name: 'PlanetScale',
      category: 'DB',
      description: 'A MySQL-compatible serverless database platform with a focus on developer experience and scalability.',
      pricing: 'Free tier available, Scaler Pro from $39/month',
      url: 'https://planetscale.com',
      connections: ['vercel'],
    },
    {
      id: 'github-actions',
      name: 'GitHub Actions',
      category: 'CI/CD',
      description: 'Automate your workflow from idea to production. Build, test, and deploy your code right from GitHub.',
      pricing: 'Free for public repositories, usage-based for private',
      url: 'https://github.com/features/actions',
      connections: [],
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { id: service.id },
      update: {},
      create: service,
    });
  }
  console.log('Services seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
