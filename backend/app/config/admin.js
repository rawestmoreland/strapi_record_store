module.exports = ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET', '958007db0c44bd23a21ab4cbe8038aee'),
  },
});
