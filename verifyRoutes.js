try {
    require('./server/routes/userRoutes');
    console.log('userRoutes.js loaded successfully');
} catch (error) {
    console.error('Error loading userRoutes.js:', error);
    process.exit(1);
}
