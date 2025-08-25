import time

# Stocke les messages envoyés par chaque utilisateur
# Format : { "numero_de_telephone": [heure_dernier_message, compteur_messages] }
message_history = {}

def is_spam(sender_id, time_threshold=1, message_limit=5):
    """
    Vérifie si un utilisateur est un spammeur en se basant sur la vitesse d'envoi des messages.

    :param sender_id: L'identifiant de l'utilisateur.
    :param time_threshold: Le nombre de secondes dans lesquelles la limite de messages doit être atteinte.
    :param message_limit: Le nombre maximum de messages autorisés dans le laps de temps.
    :return: True si l'utilisateur est considéré comme un spammeur, sinon False.
    """
    current_time = time.time()

    if sender_id not in message_history:
        # Premier message de l'utilisateur
        message_history[sender_id] = [current_time, 1]
        return False
    
    last_message_time, message_count = message_history[sender_id]

    if (current_time - last_message_time) < time_threshold:
        # L'utilisateur envoie un message trop rapidement
        message_count += 1
        message_history[sender_id][1] = message_count
        
        if message_count > message_limit:
            print(f"ALERTE SPAM: {sender_id} a été identifié comme un spammeur.")
            return True
    else:
        # Réinitialise le compteur si le délai est respecté
        message_history[sender_id] = [current_time, 1]

    return False

# Exemple d'utilisation
# Simuler l'envoi de messages
print("Simuler un envoi normal...")
is_spam("555-1234", 1, 5) # Message 1
is_spam("555-1234", 1, 5) # Message 2

print("\nSimuler un spam...")
for i in range(10):
    if is_spam("555-5678", 1, 5):
        print("Bloquer l'utilisateur 555-5678")
        break
    time.sleep(0.1)
  
