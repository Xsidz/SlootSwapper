import mongoose from 'mongoose';


class DatabaseConnection {
    constructor() {
        this.isConnected = false;
        this.connectionRetries = 0;
        this.maxRetries = 5;
        this.retryDelay = 5000; // 5 seconds
    }

    async connect() {
        try {
            const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://siddheshkabraa_db_user:Siddhesh1734@cluster0.felbc57.mongodb.net/SlotSwapper';

            
            const options = {
               
                maxPoolSize: 10, 
                minPoolSize: 2,  
                maxIdleTimeMS: 30000, 
                serverSelectionTimeoutMS: 5000, 
                socketTimeoutMS: 45000, 

                
                
                family: 4 
            };

            console.log('Connecting to MongoDB...');
            await mongoose.connect(mongoUri, options);

            this.isConnected = true;
            this.connectionRetries = 0;

            console.log('✅ MongoDB connected successfully');
            console.log(`📊 Database: ${mongoose.connection.name}`);
            console.log(`🔗 Host: ${mongoose.connection.host}:${mongoose.connection.port}`);

        } catch (error) {
            this.isConnected = false;
            console.error('❌ MongoDB connection error:', error.message);

            // Retry logic for connection failures
            if (this.connectionRetries < this.maxRetries) {
                this.connectionRetries++;
                console.log(`🔄 Retrying connection (${this.connectionRetries}/${this.maxRetries}) in ${this.retryDelay / 1000} seconds...`);

                setTimeout(() => {
                    this.connect();
                }, this.retryDelay);
            } else {
                console.error('💥 Max connection retries reached. Exiting...');
                process.exit(1);
            }
        }
    }



    /**
     * Get connection status
     */
    getConnectionStatus() {
        return {
            isConnected: this.isConnected,
            readyState: mongoose.connection.readyState,
            host: mongoose.connection.host,
            port: mongoose.connection.port,
            name: mongoose.connection.name
        };
    }
}

// Event listeners for connection monitoring
mongoose.connection.on('connected', () => {
    console.log('🔗 Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ Mongoose connection error:', error);
});

mongoose.connection.on('disconnected', () => {
    console.log('📴 Mongoose disconnected from MongoDB');
});



// Create and export database instance
const database = new DatabaseConnection();

export default database;