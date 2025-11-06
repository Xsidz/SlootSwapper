import mongoose from 'mongoose';
import { User, Event } from './models/index.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Sample users data
const sampleUsers = [
    {
        name: 'Alice Johnson',
        email: 'alice.johnson@example.com',
        password: 'Password123'
    },
    {
        name: 'Bob Smith',
        email: 'bob.smith@example.com',
        password: 'Password123'
    },
    {
        name: 'Carol Davis',
        email: 'carol.davis@example.com',
        password: 'Password123'
    },
    {
        name: 'David Wilson',
        email: 'david.wilson@example.com',
        password: 'Password123'
    },
    {
        name: 'Emma Brown',
        email: 'emma.brown@example.com',
        password: 'Password123'
    },
    {
        name: 'Frank Miller',
        email: 'frank.miller@example.com',
        password: 'Password123'
    }
];

// Sample events data
const sampleEvents = [
    {
        title: 'Team Standup Meeting',
        duration: 30, // minutes
        status: 'SWAPPABLE'
    },
    {
        title: 'Client Presentation',
        duration: 60,
        status: 'SWAPPABLE'
    },
    {
        title: 'Code Review Session',
        duration: 45,
        status: 'SWAPPABLE'
    },
    {
        title: 'Product Planning Meeting',
        duration: 90,
        status: 'SWAPPABLE'
    },
    {
        title: 'Design Workshop',
        duration: 120,
        status: 'SWAPPABLE'
    },
    {
        title: 'Training Session',
        duration: 60,
        status: 'SWAPPABLE'
    },
    {
        title: 'Sprint Retrospective',
        duration: 45,
        status: 'SWAPPABLE'
    },
    {
        title: 'Architecture Discussion',
        duration: 75,
        status: 'SWAPPABLE'
    },
    {
        title: 'User Research Interview',
        duration: 30,
        status: 'SWAPPABLE'
    },
    {
        title: 'Marketing Strategy Meeting',
        duration: 60,
        status: 'SWAPPABLE'
    },
    {
        title: 'Technical Deep Dive',
        duration: 90,
        status: 'SWAPPABLE'
    },
    {
        title: 'Quarterly Business Review',
        duration: 120,
        status: 'SWAPPABLE'
    },
    {
        title: 'Customer Feedback Session',
        duration: 45,
        status: 'SWAPPABLE'
    },
    {
        title: 'Innovation Brainstorm',
        duration: 60,
        status: 'SWAPPABLE'
    },
    {
        title: 'Security Audit Meeting',
        duration: 90,
        status: 'SWAPPABLE'
    }
];

// Helper function to generate random date within next 30 days
function getRandomFutureDate() {
    const now = new Date();
    const maxDays = 30;
    const randomDays = Math.floor(Math.random() * maxDays);
    const randomHours = Math.floor(Math.random() * 8) + 9; // 9 AM to 5 PM
    const randomMinutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45

    const date = new Date(now);
    date.setDate(date.getDate() + randomDays);
    date.setHours(randomHours, randomMinutes, 0, 0);

    return date;
}

// Helper function to create end time based on duration
function getEndTime(startTime, durationMinutes) {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    return endTime;
}

async function seedMarketplace() {
    try {
        console.log('🌱 Starting marketplace seeding...');

        // Connect to database
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/SlotSwapper');
        console.log('✅ Connected to database');

        // Clear existing seed data (keep test users)
        await User.deleteMany({
            email: {
                $in: sampleUsers.map(u => u.email)
            }
        });

        console.log('🧹 Cleared existing seed data');

        // Create users
        const createdUsers = [];
        for (const userData of sampleUsers) {
            const hashedPassword = await bcrypt.hash(userData.password, 12);
            const user = new User({
                name: userData.name,
                email: userData.email,
                password: hashedPassword
            });

            const savedUser = await user.save();
            createdUsers.push(savedUser);
            console.log(`👤 Created user: ${userData.name}`);
        }

        // Create events for each user
        const createdEvents = [];
        for (let i = 0; i < createdUsers.length; i++) {
            const user = createdUsers[i];

            // Each user gets 2-4 random events
            const numEvents = Math.floor(Math.random() * 3) + 2;
            const userEvents = [];

            for (let j = 0; j < numEvents; j++) {
                const eventTemplate = sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
                const startTime = getRandomFutureDate();
                const endTime = getEndTime(startTime, eventTemplate.duration);

                // Ensure no time conflicts for this user
                let hasConflict = true;
                let attempts = 0;

                while (hasConflict && attempts < 10) {
                    hasConflict = userEvents.some(existingEvent => {
                        return (startTime < existingEvent.endTime && endTime > existingEvent.startTime);
                    });

                    if (hasConflict) {
                        startTime.setTime(getRandomFutureDate().getTime());
                        endTime.setTime(getEndTime(startTime, eventTemplate.duration).getTime());
                        attempts++;
                    }
                }

                if (!hasConflict) {
                    const event = new Event({
                        title: eventTemplate.title,
                        startTime,
                        endTime,
                        status: eventTemplate.status,
                        userId: user._id
                    });

                    const savedEvent = await event.save();
                    createdEvents.push(savedEvent);
                    userEvents.push({ startTime, endTime });

                    console.log(`📅 Created event: "${eventTemplate.title}" for ${user.name}`);
                }
            }
        }

        console.log(`\n🎉 Marketplace seeding completed!`);
        console.log(`👥 Created ${createdUsers.length} users`);
        console.log(`📅 Created ${createdEvents.length} events`);
        console.log(`\n📋 Sample login credentials:`);

        sampleUsers.forEach((user, index) => {
            console.log(`   ${index + 1}. ${user.email} / ${user.password}`);
        });

        console.log(`\n💡 You can now login with any of these accounts to test the marketplace!`);

        await mongoose.disconnect();
        console.log('🔌 Database disconnected');

    } catch (error) {
        console.error('❌ Seeding failed:', error.message);
        process.exit(1);
    }
}

// Run the seeding
seedMarketplace();