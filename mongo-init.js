// MongoDB initialization script for SlotSwapper
db = db.getSiblingDB('slotswapper');

// Create application user
db.createUser({
    user: 'slotswapper_user',
    pwd: 'slotswapper_pass',
    roles: [
        {
            role: 'readWrite',
            db: 'slotswapper'
        }
    ]
});

// Create collections with validation
db.createCollection('users', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['name', 'email', 'password'],
            properties: {
                name: {
                    bsonType: 'string',
                    description: 'must be a string and is required'
                },
                email: {
                    bsonType: 'string',
                    pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
                    description: 'must be a valid email address and is required'
                },
                password: {
                    bsonType: 'string',
                    minLength: 8,
                    description: 'must be a string with minimum 8 characters and is required'
                }
            }
        }
    }
});

db.createCollection('events', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['title', 'startTime', 'endTime', 'status', 'userId'],
            properties: {
                title: {
                    bsonType: 'string',
                    description: 'must be a string and is required'
                },
                startTime: {
                    bsonType: 'date',
                    description: 'must be a date and is required'
                },
                endTime: {
                    bsonType: 'date',
                    description: 'must be a date and is required'
                },
                status: {
                    enum: ['BUSY', 'SWAPPABLE', 'SWAP_PENDING'],
                    description: 'must be one of the enum values and is required'
                },
                userId: {
                    bsonType: 'objectId',
                    description: 'must be an ObjectId and is required'
                }
            }
        }
    }
});

db.createCollection('swaprequests', {
    validator: {
        $jsonSchema: {
            bsonType: 'object',
            required: ['requesterUserId', 'requesterSlotId', 'targetUserId', 'targetSlotId', 'status'],
            properties: {
                requesterUserId: {
                    bsonType: 'objectId',
                    description: 'must be an ObjectId and is required'
                },
                requesterSlotId: {
                    bsonType: 'objectId',
                    description: 'must be an ObjectId and is required'
                },
                targetUserId: {
                    bsonType: 'objectId',
                    description: 'must be an ObjectId and is required'
                },
                targetSlotId: {
                    bsonType: 'objectId',
                    description: 'must be an ObjectId and is required'
                },
                status: {
                    enum: ['PENDING', 'ACCEPTED', 'REJECTED'],
                    description: 'must be one of the enum values and is required'
                }
            }
        }
    }
});

// Create indexes for performance
db.users.createIndex({ email: 1 }, { unique: true });
db.events.createIndex({ userId: 1 });
db.events.createIndex({ status: 1 });
db.events.createIndex({ startTime: 1 });
db.swaprequests.createIndex({ requesterUserId: 1 });
db.swaprequests.createIndex({ targetUserId: 1 });
db.swaprequests.createIndex({ status: 1 });

print('SlotSwapper database initialized successfully!');