const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialisation de l'Admin SDK avec les informations de votre projet
admin.initializeApp();

// Cette fonction Cloud est planifiée pour s'exécuter chaque soir à 18h00 (heure de Paris)
// Vous pouvez ajuster l'heure et la timezone selon vos besoins
exports.sendDailyReminder = functions.pubsub.schedule('every day 15:00').timeZone('Europe/Paris').onRun(async (context) => {
  // Le message à envoyer, par exemple un rappel pour les devoirs du lendemain
  const payload = {
    notification: {
      title: 'Rappel de devoirs',
      body: 'Vérifiez vos devoirs pour demain !',
      // Optionnel : ajoutez une icône accessible publiquement
      icon: 'https://votre_site.com/votre_icone.png'
    }
  };

  try {
    // Pour envoyer à tous vos clients, vous pouvez utiliser l'envoi à un topic.
    // Dans ce cas, assurez-vous que vos clients s'abonnent à ce topic via votre code client.
    const response = await admin.messaging().sendToTopic('dailyReminder', payload);
    console.log('Notification envoyée avec succès :', response);
  } catch (error) {
    console.error('Erreur lors de l’envoi de la notification :', error);
  }
  return null;
});

exports.subscribeToDailyReminder = functions.https.onCall(async (data, context) => {
    // data.token doit être envoyé par le client
    const token = data.token;
    if (!token) {
      throw new functions.https.HttpsError('invalid-argument', 'Token is required');
    }
    try {
      // Abonnez le token au topic "dailyReminder"
      const response = await admin.messaging().subscribeToTopic(token, 'dailyReminder');
      return { success: true, response };
    } catch (error) {
      throw new functions.https.HttpsError('unknown', error.message, error);
    }
  });