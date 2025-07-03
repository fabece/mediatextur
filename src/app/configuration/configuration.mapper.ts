export const ConfigurationMapper = (): { [key: string]: unknown } => ({
    NODE_ENV: process.env.NODE_ENV,
    PORT: process.env.PORT,
    ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
});
