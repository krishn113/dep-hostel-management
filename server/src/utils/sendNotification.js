import webpush from 'web-push';

// Configuration
webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

export const sendNotification = async (user, payload) => {
  if (!user.pushSubscriptions || user.pushSubscriptions.length === 0) return;

  const notifications = user.pushSubscriptions.map(sub => {
    return webpush.sendNotification(sub, JSON.stringify(payload))
      .catch(async (err) => {
        // If the subscription is expired or invalid, remove it from the DB
        if (err.statusCode === 410 || err.statusCode === 404) {
          await User.findByIdAndUpdate(user._id, {
            $pull: { pushSubscriptions: { endpoint: sub.endpoint } }
          });
        }
      });
  });

  await Promise.all(notifications);
};