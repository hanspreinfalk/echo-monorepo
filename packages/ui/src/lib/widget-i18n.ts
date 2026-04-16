/**
 * Shared widget locale metadata + UI string translations.
 *
 * The widget uses these in two ways:
 * 1. Hardcoded widget UI chrome strings (e.g. "Hi there", "Continue") are
 *    translated via {@link WIDGET_UI_STRINGS}. The renderer picks a bundle
 *    based on the browser's navigator.language, falling back to the
 *    organization's defaultLanguage, then to English.
 * 2. Admin-authored content (greetMessage, defaultSuggestions) is stored
 *    per-language on widgetSettings. Picking is handled the same way via
 *    {@link pickBestLanguage}.
 *
 * Keeping this in @workspace/ui lets both apps/widget (runtime) and
 * apps/web (customization form + preview) share the same language list
 * and string tables.
 */

/** A locale we offer in the customization form's language picker. */
export type WidgetSupportedLanguage = {
  /** BCP-47 primary subtag (e.g. "en", "de", "pt-BR"). */
  code: string;
  /** Display label (native name) for the language picker. */
  label: string;
};

/**
 * Curated list of languages offered in the admin picker. The widget itself
 * can accept any BCP-47 tag the admin saves — this list only gates the UI.
 */
export const WIDGET_SUPPORTED_LANGUAGES: readonly WidgetSupportedLanguage[] = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "pt-BR", label: "Português (Brasil)" },
  { code: "nl", label: "Nederlands" },
  { code: "pl", label: "Polski" },
  { code: "sv", label: "Svenska" },
  { code: "da", label: "Dansk" },
  { code: "no", label: "Norsk" },
  { code: "fi", label: "Suomi" },
  { code: "tr", label: "Türkçe" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Українська" },
  { code: "cs", label: "Čeština" },
  { code: "el", label: "Ελληνικά" },
  { code: "ar", label: "العربية" },
  { code: "he", label: "עברית" },
  { code: "hi", label: "हिन्दी" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "zh", label: "中文 (简体)" },
  { code: "zh-TW", label: "中文 (繁體)" },
] as const;

export type WidgetLanguageCode = (typeof WIDGET_SUPPORTED_LANGUAGES)[number]["code"];

export const DEFAULT_WIDGET_LANGUAGE: string = "en";

/**
 * All UI-chrome strings rendered by the widget (things NOT authored by
 * admins). Keep keys flat and narrowly scoped — anything admin-authored
 * belongs in widgetSettings, not here.
 */
export type WidgetStringKey =
  | "greeting.title"
  | "greeting.subtitle"
  | "greeting.subtitleExtended"
  | "loading.default"
  | "loading.findingOrg"
  | "loading.verifyingOrg"
  | "loading.findingSession"
  | "loading.validatingSession"
  | "loading.loadingSettings"
  | "error.invalidConfig"
  | "error.missingOrgId"
  | "error.unableVerify"
  | "error.missingOrgIdShort"
  | "auth.yourDetails"
  | "auth.nameLabel"
  | "auth.namePlaceholder"
  | "auth.nameRequired"
  | "auth.emailLabel"
  | "auth.emailPlaceholder"
  | "auth.emailInvalid"
  | "auth.continue"
  | "selection.chatWithUs"
  | "selection.oneMoment"
  | "selection.recentChats"
  | "selection.chat"
  | "selection.signOutAria"
  | "selection.signOutTitle"
  | "selection.signOutDescription"
  | "selection.cancel"
  | "selection.signOut"
  | "chat.headerTitle"
  | "chat.deleteConversationTitle"
  | "chat.deleteConversationDescription"
  | "chat.cancel"
  | "chat.delete"
  | "chat.deleting"
  | "chat.attach"
  | "chat.screenshot"
  | "chat.typeYourMessage"
  | "chat.conversationResolved"
  | "chat.screenshotNotEmbedded"
  | "chat.screenshotTimedOut"
  | "chat.screenshotDataMissing"
  | "chat.screenshotFailedGeneric"
  | "chat.attachmentTooLarge";

type WidgetStrings = Record<WidgetStringKey, string>;

/**
 * Translation bundles. Every language we expose in the picker ships with a
 * complete bundle so the widget never falls back silently.
 */
export const WIDGET_UI_STRINGS: Record<string, WidgetStrings> = {
  en: {
    "greeting.title": "Hi there",
    "greeting.subtitle": "Let's get you started",
    "greeting.subtitleExtended": "Let's get you started. We're here when you need us.",
    "loading.default": "Loading...",
    "loading.findingOrg": "Finding organization ID...",
    "loading.verifyingOrg": "Verifying organization...",
    "loading.findingSession": "Finding contact session ID...",
    "loading.validatingSession": "Validating session...",
    "loading.loadingSettings": "Loading widget settings...",
    "error.invalidConfig": "Invalid configuration",
    "error.missingOrgId": "Missing Organization ID",
    "error.unableVerify": "Unable to verify organization",
    "error.missingOrgIdShort": "Organization ID is required",
    "auth.yourDetails": "Your details",
    "auth.nameLabel": "Name",
    "auth.namePlaceholder": "e.g. John Doe",
    "auth.nameRequired": "Name is required",
    "auth.emailLabel": "Email",
    "auth.emailPlaceholder": "e.g. john.doe@example.com",
    "auth.emailInvalid": "Invalid email address",
    "auth.continue": "Continue",
    "selection.chatWithUs": "Chat with us",
    "selection.oneMoment": "One moment…",
    "selection.recentChats": "Recent chats",
    "selection.chat": "Chat",
    "selection.signOutAria": "Sign out",
    "selection.signOutTitle": "Sign out",
    "selection.signOutDescription":
      "Are you sure you want to sign out? You will need to enter your details again to start a new chat session.",
    "selection.cancel": "Cancel",
    "selection.signOut": "Sign out",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Delete conversation",
    "chat.deleteConversationDescription":
      "Are you sure you want to delete this conversation? All messages and attachments will be permanently removed. This action cannot be undone.",
    "chat.cancel": "Cancel",
    "chat.delete": "Delete",
    "chat.deleting": "Deleting...",
    "chat.attach": "Attach",
    "chat.screenshot": "Screenshot",
    "chat.typeYourMessage": "Type your message...",
    "chat.conversationResolved": "This conversation has been resolved.",
    "chat.screenshotNotEmbedded":
      "Screenshots of your site are available when the chat is embedded on your page.",
    "chat.screenshotTimedOut": "Screenshot timed out. Try again.",
    "chat.screenshotDataMissing": "Screenshot data was missing.",
    "chat.screenshotFailedGeneric": "Screenshot failed.",
    "chat.attachmentTooLarge": '"{name}" exceeds the 10 MB limit.',
  },
  es: {
    "greeting.title": "Hola",
    "greeting.subtitle": "Empecemos",
    "greeting.subtitleExtended": "Empecemos. Estamos aquí cuando nos necesites.",
    "loading.default": "Cargando...",
    "loading.findingOrg": "Buscando ID de organización...",
    "loading.verifyingOrg": "Verificando organización...",
    "loading.findingSession": "Buscando ID de sesión...",
    "loading.validatingSession": "Validando sesión...",
    "loading.loadingSettings": "Cargando configuración del widget...",
    "error.invalidConfig": "Configuración no válida",
    "error.missingOrgId": "Falta el ID de organización",
    "error.unableVerify": "No se pudo verificar la organización",
    "error.missingOrgIdShort": "Se requiere el ID de organización",
    "auth.yourDetails": "Tus datos",
    "auth.nameLabel": "Nombre",
    "auth.namePlaceholder": "Ej. Juan Pérez",
    "auth.nameRequired": "El nombre es obligatorio",
    "auth.emailLabel": "Correo electrónico",
    "auth.emailPlaceholder": "Ej. juan.perez@ejemplo.com",
    "auth.emailInvalid": "Correo electrónico no válido",
    "auth.continue": "Continuar",
    "selection.chatWithUs": "Chatea con nosotros",
    "selection.oneMoment": "Un momento…",
    "selection.recentChats": "Chats recientes",
    "selection.chat": "Chat",
    "selection.signOutAria": "Cerrar sesión",
    "selection.signOutTitle": "Cerrar sesión",
    "selection.signOutDescription":
      "¿Seguro que quieres cerrar sesión? Tendrás que introducir tus datos de nuevo para iniciar una nueva sesión de chat.",
    "selection.cancel": "Cancelar",
    "selection.signOut": "Cerrar sesión",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Eliminar conversación",
    "chat.deleteConversationDescription":
      "¿Seguro que quieres eliminar esta conversación? Todos los mensajes y archivos adjuntos se eliminarán permanentemente. Esta acción no se puede deshacer.",
    "chat.cancel": "Cancelar",
    "chat.delete": "Eliminar",
    "chat.deleting": "Eliminando...",
    "chat.attach": "Adjuntar",
    "chat.screenshot": "Captura",
    "chat.typeYourMessage": "Escribe tu mensaje...",
    "chat.conversationResolved": "Esta conversación se ha resuelto.",
    "chat.screenshotNotEmbedded":
      "Las capturas de tu sitio están disponibles cuando el chat está integrado en tu página.",
    "chat.screenshotTimedOut": "La captura tardó demasiado. Inténtalo de nuevo.",
    "chat.screenshotDataMissing": "Faltaban los datos de la captura.",
    "chat.screenshotFailedGeneric": "Error en la captura.",
    "chat.attachmentTooLarge": '"{name}" supera el límite de 10 MB.',
  },
  de: {
    "greeting.title": "Hallo",
    "greeting.subtitle": "Legen wir los",
    "greeting.subtitleExtended":
      "Legen wir los. Wir sind hier, wenn Sie uns brauchen.",
    "loading.default": "Wird geladen...",
    "loading.findingOrg": "Organisations-ID wird gesucht...",
    "loading.verifyingOrg": "Organisation wird geprüft...",
    "loading.findingSession": "Sitzungs-ID wird gesucht...",
    "loading.validatingSession": "Sitzung wird geprüft...",
    "loading.loadingSettings": "Widget-Einstellungen werden geladen...",
    "error.invalidConfig": "Ungültige Konfiguration",
    "error.missingOrgId": "Organisations-ID fehlt",
    "error.unableVerify": "Organisation konnte nicht verifiziert werden",
    "error.missingOrgIdShort": "Organisations-ID ist erforderlich",
    "auth.yourDetails": "Ihre Daten",
    "auth.nameLabel": "Name",
    "auth.namePlaceholder": "z. B. Max Mustermann",
    "auth.nameRequired": "Name ist erforderlich",
    "auth.emailLabel": "E-Mail",
    "auth.emailPlaceholder": "z. B. max.mustermann@beispiel.de",
    "auth.emailInvalid": "Ungültige E-Mail-Adresse",
    "auth.continue": "Weiter",
    "selection.chatWithUs": "Chatten Sie mit uns",
    "selection.oneMoment": "Einen Moment…",
    "selection.recentChats": "Letzte Chats",
    "selection.chat": "Chat",
    "selection.signOutAria": "Abmelden",
    "selection.signOutTitle": "Abmelden",
    "selection.signOutDescription":
      "Möchten Sie sich wirklich abmelden? Sie müssen Ihre Daten erneut eingeben, um eine neue Chatsitzung zu starten.",
    "selection.cancel": "Abbrechen",
    "selection.signOut": "Abmelden",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Unterhaltung löschen",
    "chat.deleteConversationDescription":
      "Möchten Sie diese Unterhaltung wirklich löschen? Alle Nachrichten und Anhänge werden endgültig entfernt. Diese Aktion kann nicht rückgängig gemacht werden.",
    "chat.cancel": "Abbrechen",
    "chat.delete": "Löschen",
    "chat.deleting": "Wird gelöscht...",
    "chat.attach": "Anhängen",
    "chat.screenshot": "Screenshot",
    "chat.typeYourMessage": "Nachricht eingeben...",
    "chat.conversationResolved": "Diese Unterhaltung wurde abgeschlossen.",
    "chat.screenshotNotEmbedded":
      "Screenshots Ihrer Website sind verfügbar, wenn der Chat auf Ihrer Seite eingebettet ist.",
    "chat.screenshotTimedOut":
      "Screenshot-Zeitüberschreitung. Bitte erneut versuchen.",
    "chat.screenshotDataMissing": "Screenshot-Daten fehlten.",
    "chat.screenshotFailedGeneric": "Screenshot fehlgeschlagen.",
    "chat.attachmentTooLarge": '"{name}" überschreitet das 10-MB-Limit.',
  },
  fr: {
    "greeting.title": "Bonjour",
    "greeting.subtitle": "Commençons",
    "greeting.subtitleExtended":
      "Commençons. Nous sommes là quand vous avez besoin de nous.",
    "loading.default": "Chargement...",
    "loading.findingOrg": "Recherche de l'ID de l'organisation...",
    "loading.verifyingOrg": "Vérification de l'organisation...",
    "loading.findingSession": "Recherche de l'ID de session...",
    "loading.validatingSession": "Validation de la session...",
    "loading.loadingSettings": "Chargement des paramètres du widget...",
    "error.invalidConfig": "Configuration invalide",
    "error.missingOrgId": "ID d'organisation manquant",
    "error.unableVerify": "Impossible de vérifier l'organisation",
    "error.missingOrgIdShort": "L'ID d'organisation est requis",
    "auth.yourDetails": "Vos informations",
    "auth.nameLabel": "Nom",
    "auth.namePlaceholder": "ex. Jean Dupont",
    "auth.nameRequired": "Le nom est requis",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "ex. jean.dupont@exemple.com",
    "auth.emailInvalid": "Adresse e-mail invalide",
    "auth.continue": "Continuer",
    "selection.chatWithUs": "Discutez avec nous",
    "selection.oneMoment": "Un instant…",
    "selection.recentChats": "Discussions récentes",
    "selection.chat": "Discussion",
    "selection.signOutAria": "Se déconnecter",
    "selection.signOutTitle": "Se déconnecter",
    "selection.signOutDescription":
      "Voulez-vous vraiment vous déconnecter ? Vous devrez saisir à nouveau vos informations pour démarrer une nouvelle session.",
    "selection.cancel": "Annuler",
    "selection.signOut": "Se déconnecter",
    "chat.headerTitle": "Discussion",
    "chat.deleteConversationTitle": "Supprimer la conversation",
    "chat.deleteConversationDescription":
      "Voulez-vous vraiment supprimer cette conversation ? Tous les messages et pièces jointes seront supprimés définitivement. Cette action est irréversible.",
    "chat.cancel": "Annuler",
    "chat.delete": "Supprimer",
    "chat.deleting": "Suppression...",
    "chat.attach": "Joindre",
    "chat.screenshot": "Capture",
    "chat.typeYourMessage": "Tapez votre message...",
    "chat.conversationResolved": "Cette conversation a été résolue.",
    "chat.screenshotNotEmbedded":
      "Les captures d'écran de votre site sont disponibles lorsque le chat est intégré à votre page.",
    "chat.screenshotTimedOut":
      "La capture a expiré. Veuillez réessayer.",
    "chat.screenshotDataMissing": "Les données de la capture étaient manquantes.",
    "chat.screenshotFailedGeneric": "Échec de la capture.",
    "chat.attachmentTooLarge": '"{name}" dépasse la limite de 10 Mo.',
  },
  it: {
    "greeting.title": "Ciao",
    "greeting.subtitle": "Iniziamo",
    "greeting.subtitleExtended": "Iniziamo. Siamo qui quando hai bisogno di noi.",
    "loading.default": "Caricamento...",
    "loading.findingOrg": "Ricerca ID organizzazione...",
    "loading.verifyingOrg": "Verifica organizzazione...",
    "loading.findingSession": "Ricerca ID sessione...",
    "loading.validatingSession": "Convalida sessione...",
    "loading.loadingSettings": "Caricamento impostazioni widget...",
    "error.invalidConfig": "Configurazione non valida",
    "error.missingOrgId": "ID organizzazione mancante",
    "error.unableVerify": "Impossibile verificare l'organizzazione",
    "error.missingOrgIdShort": "ID organizzazione richiesto",
    "auth.yourDetails": "I tuoi dati",
    "auth.nameLabel": "Nome",
    "auth.namePlaceholder": "es. Mario Rossi",
    "auth.nameRequired": "Il nome è obbligatorio",
    "auth.emailLabel": "Email",
    "auth.emailPlaceholder": "es. mario.rossi@esempio.com",
    "auth.emailInvalid": "Indirizzo email non valido",
    "auth.continue": "Continua",
    "selection.chatWithUs": "Chatta con noi",
    "selection.oneMoment": "Un momento…",
    "selection.recentChats": "Chat recenti",
    "selection.chat": "Chat",
    "selection.signOutAria": "Esci",
    "selection.signOutTitle": "Esci",
    "selection.signOutDescription":
      "Sei sicuro di voler uscire? Dovrai inserire nuovamente i tuoi dati per avviare una nuova sessione di chat.",
    "selection.cancel": "Annulla",
    "selection.signOut": "Esci",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Elimina conversazione",
    "chat.deleteConversationDescription":
      "Sei sicuro di voler eliminare questa conversazione? Tutti i messaggi e gli allegati verranno rimossi in modo permanente. Questa azione non può essere annullata.",
    "chat.cancel": "Annulla",
    "chat.delete": "Elimina",
    "chat.deleting": "Eliminazione...",
    "chat.attach": "Allega",
    "chat.screenshot": "Screenshot",
    "chat.typeYourMessage": "Scrivi il tuo messaggio...",
    "chat.conversationResolved": "Questa conversazione è stata risolta.",
    "chat.screenshotNotEmbedded":
      "Gli screenshot del tuo sito sono disponibili quando la chat è incorporata nella pagina.",
    "chat.screenshotTimedOut": "Screenshot scaduto. Riprova.",
    "chat.screenshotDataMissing": "Dati dello screenshot mancanti.",
    "chat.screenshotFailedGeneric": "Screenshot non riuscito.",
    "chat.attachmentTooLarge": '"{name}" supera il limite di 10 MB.',
  },
  pt: {
    "greeting.title": "Olá",
    "greeting.subtitle": "Vamos começar",
    "greeting.subtitleExtended":
      "Vamos começar. Estamos aqui quando precisar de nós.",
    "loading.default": "A carregar...",
    "loading.findingOrg": "A encontrar ID da organização...",
    "loading.verifyingOrg": "A verificar organização...",
    "loading.findingSession": "A encontrar ID da sessão...",
    "loading.validatingSession": "A validar sessão...",
    "loading.loadingSettings": "A carregar definições do widget...",
    "error.invalidConfig": "Configuração inválida",
    "error.missingOrgId": "Falta o ID da organização",
    "error.unableVerify": "Não foi possível verificar a organização",
    "error.missingOrgIdShort": "O ID da organização é obrigatório",
    "auth.yourDetails": "Os seus dados",
    "auth.nameLabel": "Nome",
    "auth.namePlaceholder": "ex. João Silva",
    "auth.nameRequired": "O nome é obrigatório",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "ex. joao.silva@exemplo.com",
    "auth.emailInvalid": "Endereço de e-mail inválido",
    "auth.continue": "Continuar",
    "selection.chatWithUs": "Fale connosco",
    "selection.oneMoment": "Um momento…",
    "selection.recentChats": "Conversas recentes",
    "selection.chat": "Conversa",
    "selection.signOutAria": "Terminar sessão",
    "selection.signOutTitle": "Terminar sessão",
    "selection.signOutDescription":
      "Tem a certeza de que quer terminar a sessão? Terá de introduzir os seus dados novamente para iniciar uma nova conversa.",
    "selection.cancel": "Cancelar",
    "selection.signOut": "Terminar sessão",
    "chat.headerTitle": "Conversa",
    "chat.deleteConversationTitle": "Eliminar conversa",
    "chat.deleteConversationDescription":
      "Tem a certeza de que quer eliminar esta conversa? Todas as mensagens e anexos serão removidos permanentemente. Esta ação não pode ser anulada.",
    "chat.cancel": "Cancelar",
    "chat.delete": "Eliminar",
    "chat.deleting": "A eliminar...",
    "chat.attach": "Anexar",
    "chat.screenshot": "Captura",
    "chat.typeYourMessage": "Escreva a sua mensagem...",
    "chat.conversationResolved": "Esta conversa foi resolvida.",
    "chat.screenshotNotEmbedded":
      "As capturas do seu site estão disponíveis quando o chat está incorporado na página.",
    "chat.screenshotTimedOut": "A captura demorou demasiado. Tente novamente.",
    "chat.screenshotDataMissing": "Dados da captura em falta.",
    "chat.screenshotFailedGeneric": "Falha na captura.",
    "chat.attachmentTooLarge": '"{name}" excede o limite de 10 MB.',
  },
  "pt-BR": {
    "greeting.title": "Olá",
    "greeting.subtitle": "Vamos começar",
    "greeting.subtitleExtended":
      "Vamos começar. Estamos aqui quando você precisar.",
    "loading.default": "Carregando...",
    "loading.findingOrg": "Localizando ID da organização...",
    "loading.verifyingOrg": "Verificando organização...",
    "loading.findingSession": "Localizando ID da sessão...",
    "loading.validatingSession": "Validando sessão...",
    "loading.loadingSettings": "Carregando configurações do widget...",
    "error.invalidConfig": "Configuração inválida",
    "error.missingOrgId": "Falta o ID da organização",
    "error.unableVerify": "Não foi possível verificar a organização",
    "error.missingOrgIdShort": "O ID da organização é obrigatório",
    "auth.yourDetails": "Seus dados",
    "auth.nameLabel": "Nome",
    "auth.namePlaceholder": "ex. João Silva",
    "auth.nameRequired": "O nome é obrigatório",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "ex. joao.silva@exemplo.com",
    "auth.emailInvalid": "Endereço de e-mail inválido",
    "auth.continue": "Continuar",
    "selection.chatWithUs": "Fale com a gente",
    "selection.oneMoment": "Um momento…",
    "selection.recentChats": "Conversas recentes",
    "selection.chat": "Conversa",
    "selection.signOutAria": "Sair",
    "selection.signOutTitle": "Sair",
    "selection.signOutDescription":
      "Tem certeza de que deseja sair? Você precisará inserir seus dados novamente para iniciar uma nova conversa.",
    "selection.cancel": "Cancelar",
    "selection.signOut": "Sair",
    "chat.headerTitle": "Conversa",
    "chat.deleteConversationTitle": "Excluir conversa",
    "chat.deleteConversationDescription":
      "Tem certeza de que deseja excluir esta conversa? Todas as mensagens e anexos serão removidos permanentemente. Esta ação não pode ser desfeita.",
    "chat.cancel": "Cancelar",
    "chat.delete": "Excluir",
    "chat.deleting": "Excluindo...",
    "chat.attach": "Anexar",
    "chat.screenshot": "Captura",
    "chat.typeYourMessage": "Digite sua mensagem...",
    "chat.conversationResolved": "Esta conversa foi resolvida.",
    "chat.screenshotNotEmbedded":
      "Capturas de tela do seu site ficam disponíveis quando o chat está incorporado na página.",
    "chat.screenshotTimedOut": "A captura expirou. Tente novamente.",
    "chat.screenshotDataMissing": "Os dados da captura estavam ausentes.",
    "chat.screenshotFailedGeneric": "Falha na captura.",
    "chat.attachmentTooLarge": '"{name}" excede o limite de 10 MB.',
  },
  nl: {
    "greeting.title": "Hallo",
    "greeting.subtitle": "Laten we beginnen",
    "greeting.subtitleExtended":
      "Laten we beginnen. We zijn er wanneer je ons nodig hebt.",
    "loading.default": "Laden...",
    "loading.findingOrg": "Organisatie-ID zoeken...",
    "loading.verifyingOrg": "Organisatie verifiëren...",
    "loading.findingSession": "Sessie-ID zoeken...",
    "loading.validatingSession": "Sessie valideren...",
    "loading.loadingSettings": "Widget-instellingen laden...",
    "error.invalidConfig": "Ongeldige configuratie",
    "error.missingOrgId": "Organisatie-ID ontbreekt",
    "error.unableVerify": "Organisatie kon niet worden geverifieerd",
    "error.missingOrgIdShort": "Organisatie-ID is vereist",
    "auth.yourDetails": "Jouw gegevens",
    "auth.nameLabel": "Naam",
    "auth.namePlaceholder": "bijv. Jan Janssen",
    "auth.nameRequired": "Naam is verplicht",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "bijv. jan.janssen@voorbeeld.nl",
    "auth.emailInvalid": "Ongeldig e-mailadres",
    "auth.continue": "Doorgaan",
    "selection.chatWithUs": "Chat met ons",
    "selection.oneMoment": "Een moment…",
    "selection.recentChats": "Recente chats",
    "selection.chat": "Chat",
    "selection.signOutAria": "Uitloggen",
    "selection.signOutTitle": "Uitloggen",
    "selection.signOutDescription":
      "Weet je zeker dat je wilt uitloggen? Je moet je gegevens opnieuw invoeren om een nieuwe chatsessie te starten.",
    "selection.cancel": "Annuleren",
    "selection.signOut": "Uitloggen",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Gesprek verwijderen",
    "chat.deleteConversationDescription":
      "Weet je zeker dat je dit gesprek wilt verwijderen? Alle berichten en bijlagen worden permanent verwijderd. Deze actie kan niet ongedaan worden gemaakt.",
    "chat.cancel": "Annuleren",
    "chat.delete": "Verwijderen",
    "chat.deleting": "Verwijderen...",
    "chat.attach": "Bijlage",
    "chat.screenshot": "Screenshot",
    "chat.typeYourMessage": "Typ je bericht...",
    "chat.conversationResolved": "Dit gesprek is opgelost.",
    "chat.screenshotNotEmbedded":
      "Screenshots van je site zijn beschikbaar wanneer de chat is ingebed op je pagina.",
    "chat.screenshotTimedOut":
      "Screenshot duurde te lang. Probeer het opnieuw.",
    "chat.screenshotDataMissing": "Screenshot-gegevens ontbraken.",
    "chat.screenshotFailedGeneric": "Screenshot mislukt.",
    "chat.attachmentTooLarge": '"{name}" is groter dan 10 MB.',
  },
  pl: {
    "greeting.title": "Cześć",
    "greeting.subtitle": "Zacznijmy",
    "greeting.subtitleExtended":
      "Zacznijmy. Jesteśmy tutaj, gdy nas potrzebujesz.",
    "loading.default": "Ładowanie...",
    "loading.findingOrg": "Wyszukiwanie ID organizacji...",
    "loading.verifyingOrg": "Weryfikacja organizacji...",
    "loading.findingSession": "Wyszukiwanie ID sesji...",
    "loading.validatingSession": "Walidacja sesji...",
    "loading.loadingSettings": "Ładowanie ustawień widżetu...",
    "error.invalidConfig": "Nieprawidłowa konfiguracja",
    "error.missingOrgId": "Brak ID organizacji",
    "error.unableVerify": "Nie można zweryfikować organizacji",
    "error.missingOrgIdShort": "ID organizacji jest wymagane",
    "auth.yourDetails": "Twoje dane",
    "auth.nameLabel": "Imię",
    "auth.namePlaceholder": "np. Jan Kowalski",
    "auth.nameRequired": "Imię jest wymagane",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "np. jan.kowalski@przyklad.pl",
    "auth.emailInvalid": "Nieprawidłowy adres e-mail",
    "auth.continue": "Kontynuuj",
    "selection.chatWithUs": "Porozmawiaj z nami",
    "selection.oneMoment": "Chwileczkę…",
    "selection.recentChats": "Ostatnie czaty",
    "selection.chat": "Czat",
    "selection.signOutAria": "Wyloguj się",
    "selection.signOutTitle": "Wyloguj się",
    "selection.signOutDescription":
      "Czy na pewno chcesz się wylogować? Aby rozpocząć nową sesję, musisz ponownie podać swoje dane.",
    "selection.cancel": "Anuluj",
    "selection.signOut": "Wyloguj się",
    "chat.headerTitle": "Czat",
    "chat.deleteConversationTitle": "Usuń rozmowę",
    "chat.deleteConversationDescription":
      "Czy na pewno chcesz usunąć tę rozmowę? Wszystkie wiadomości i załączniki zostaną trwale usunięte. Tej operacji nie można cofnąć.",
    "chat.cancel": "Anuluj",
    "chat.delete": "Usuń",
    "chat.deleting": "Usuwanie...",
    "chat.attach": "Załącz",
    "chat.screenshot": "Zrzut ekranu",
    "chat.typeYourMessage": "Wpisz wiadomość...",
    "chat.conversationResolved": "Ta rozmowa została rozwiązana.",
    "chat.screenshotNotEmbedded":
      "Zrzuty ekranu strony są dostępne, gdy czat jest osadzony na Twojej stronie.",
    "chat.screenshotTimedOut":
      "Przekroczono czas wykonywania zrzutu ekranu. Spróbuj ponownie.",
    "chat.screenshotDataMissing": "Brak danych zrzutu ekranu.",
    "chat.screenshotFailedGeneric": "Nie udało się wykonać zrzutu ekranu.",
    "chat.attachmentTooLarge": '"{name}" przekracza limit 10 MB.',
  },
  sv: {
    "greeting.title": "Hej",
    "greeting.subtitle": "Låt oss sätta igång",
    "greeting.subtitleExtended":
      "Låt oss sätta igång. Vi finns här när du behöver oss.",
    "loading.default": "Laddar...",
    "loading.findingOrg": "Hittar organisations-ID...",
    "loading.verifyingOrg": "Verifierar organisation...",
    "loading.findingSession": "Hittar sessions-ID...",
    "loading.validatingSession": "Validerar session...",
    "loading.loadingSettings": "Laddar widget-inställningar...",
    "error.invalidConfig": "Ogiltig konfiguration",
    "error.missingOrgId": "Organisations-ID saknas",
    "error.unableVerify": "Kan inte verifiera organisationen",
    "error.missingOrgIdShort": "Organisations-ID krävs",
    "auth.yourDetails": "Dina uppgifter",
    "auth.nameLabel": "Namn",
    "auth.namePlaceholder": "t.ex. Anna Andersson",
    "auth.nameRequired": "Namn krävs",
    "auth.emailLabel": "E-post",
    "auth.emailPlaceholder": "t.ex. anna.andersson@exempel.se",
    "auth.emailInvalid": "Ogiltig e-postadress",
    "auth.continue": "Fortsätt",
    "selection.chatWithUs": "Chatta med oss",
    "selection.oneMoment": "Ett ögonblick…",
    "selection.recentChats": "Senaste chattarna",
    "selection.chat": "Chatt",
    "selection.signOutAria": "Logga ut",
    "selection.signOutTitle": "Logga ut",
    "selection.signOutDescription":
      "Är du säker på att du vill logga ut? Du måste ange dina uppgifter igen för att starta en ny chatt.",
    "selection.cancel": "Avbryt",
    "selection.signOut": "Logga ut",
    "chat.headerTitle": "Chatt",
    "chat.deleteConversationTitle": "Ta bort konversation",
    "chat.deleteConversationDescription":
      "Är du säker på att du vill ta bort den här konversationen? Alla meddelanden och bilagor tas bort permanent. Åtgärden kan inte ångras.",
    "chat.cancel": "Avbryt",
    "chat.delete": "Ta bort",
    "chat.deleting": "Tar bort...",
    "chat.attach": "Bifoga",
    "chat.screenshot": "Skärmbild",
    "chat.typeYourMessage": "Skriv ditt meddelande...",
    "chat.conversationResolved": "Den här konversationen har lösts.",
    "chat.screenshotNotEmbedded":
      "Skärmbilder av din webbplats är tillgängliga när chatten är inbäddad på din sida.",
    "chat.screenshotTimedOut":
      "Skärmbilden tog för lång tid. Försök igen.",
    "chat.screenshotDataMissing": "Skärmbildsdata saknades.",
    "chat.screenshotFailedGeneric": "Skärmbilden misslyckades.",
    "chat.attachmentTooLarge": '"{name}" överskrider gränsen på 10 MB.',
  },
  da: {
    "greeting.title": "Hej",
    "greeting.subtitle": "Lad os komme i gang",
    "greeting.subtitleExtended":
      "Lad os komme i gang. Vi er her, når du har brug for os.",
    "loading.default": "Indlæser...",
    "loading.findingOrg": "Finder organisations-ID...",
    "loading.verifyingOrg": "Verificerer organisation...",
    "loading.findingSession": "Finder sessions-ID...",
    "loading.validatingSession": "Validerer session...",
    "loading.loadingSettings": "Indlæser widget-indstillinger...",
    "error.invalidConfig": "Ugyldig konfiguration",
    "error.missingOrgId": "Organisations-ID mangler",
    "error.unableVerify": "Kan ikke verificere organisationen",
    "error.missingOrgIdShort": "Organisations-ID er påkrævet",
    "auth.yourDetails": "Dine oplysninger",
    "auth.nameLabel": "Navn",
    "auth.namePlaceholder": "f.eks. Jens Hansen",
    "auth.nameRequired": "Navn er påkrævet",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "f.eks. jens.hansen@eksempel.dk",
    "auth.emailInvalid": "Ugyldig e-mailadresse",
    "auth.continue": "Fortsæt",
    "selection.chatWithUs": "Chat med os",
    "selection.oneMoment": "Et øjeblik…",
    "selection.recentChats": "Seneste chats",
    "selection.chat": "Chat",
    "selection.signOutAria": "Log ud",
    "selection.signOutTitle": "Log ud",
    "selection.signOutDescription":
      "Er du sikker på, at du vil logge ud? Du skal indtaste dine oplysninger igen for at starte en ny chatsession.",
    "selection.cancel": "Annuller",
    "selection.signOut": "Log ud",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Slet samtale",
    "chat.deleteConversationDescription":
      "Er du sikker på, at du vil slette denne samtale? Alle beskeder og vedhæftede filer fjernes permanent. Handlingen kan ikke fortrydes.",
    "chat.cancel": "Annuller",
    "chat.delete": "Slet",
    "chat.deleting": "Sletter...",
    "chat.attach": "Vedhæft",
    "chat.screenshot": "Skærmbillede",
    "chat.typeYourMessage": "Skriv din besked...",
    "chat.conversationResolved": "Denne samtale er løst.",
    "chat.screenshotNotEmbedded":
      "Skærmbilleder af dit website er tilgængelige, når chatten er integreret på siden.",
    "chat.screenshotTimedOut":
      "Skærmbilledet fik timeout. Prøv igen.",
    "chat.screenshotDataMissing": "Skærmbilleddata manglede.",
    "chat.screenshotFailedGeneric": "Skærmbillede mislykkedes.",
    "chat.attachmentTooLarge": '"{name}" overskrider grænsen på 10 MB.',
  },
  no: {
    "greeting.title": "Hei",
    "greeting.subtitle": "La oss komme i gang",
    "greeting.subtitleExtended":
      "La oss komme i gang. Vi er her når du trenger oss.",
    "loading.default": "Laster...",
    "loading.findingOrg": "Finner organisasjons-ID...",
    "loading.verifyingOrg": "Verifiserer organisasjon...",
    "loading.findingSession": "Finner sesjons-ID...",
    "loading.validatingSession": "Validerer sesjon...",
    "loading.loadingSettings": "Laster widget-innstillinger...",
    "error.invalidConfig": "Ugyldig konfigurasjon",
    "error.missingOrgId": "Organisasjons-ID mangler",
    "error.unableVerify": "Kan ikke verifisere organisasjonen",
    "error.missingOrgIdShort": "Organisasjons-ID er påkrevd",
    "auth.yourDetails": "Dine opplysninger",
    "auth.nameLabel": "Navn",
    "auth.namePlaceholder": "f.eks. Ola Nordmann",
    "auth.nameRequired": "Navn er påkrevd",
    "auth.emailLabel": "E-post",
    "auth.emailPlaceholder": "f.eks. ola.nordmann@eksempel.no",
    "auth.emailInvalid": "Ugyldig e-postadresse",
    "auth.continue": "Fortsett",
    "selection.chatWithUs": "Chat med oss",
    "selection.oneMoment": "Et øyeblikk…",
    "selection.recentChats": "Nylige chatter",
    "selection.chat": "Chat",
    "selection.signOutAria": "Logg ut",
    "selection.signOutTitle": "Logg ut",
    "selection.signOutDescription":
      "Er du sikker på at du vil logge ut? Du må oppgi opplysningene dine igjen for å starte en ny chat.",
    "selection.cancel": "Avbryt",
    "selection.signOut": "Logg ut",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Slett samtale",
    "chat.deleteConversationDescription":
      "Er du sikker på at du vil slette denne samtalen? Alle meldinger og vedlegg fjernes permanent. Handlingen kan ikke angres.",
    "chat.cancel": "Avbryt",
    "chat.delete": "Slett",
    "chat.deleting": "Sletter...",
    "chat.attach": "Legg ved",
    "chat.screenshot": "Skjermbilde",
    "chat.typeYourMessage": "Skriv meldingen din...",
    "chat.conversationResolved": "Denne samtalen er løst.",
    "chat.screenshotNotEmbedded":
      "Skjermbilder av nettstedet er tilgjengelig når chatten er integrert på siden.",
    "chat.screenshotTimedOut":
      "Skjermbildet tok for lang tid. Prøv igjen.",
    "chat.screenshotDataMissing": "Skjermbildedata manglet.",
    "chat.screenshotFailedGeneric": "Skjermbilde mislyktes.",
    "chat.attachmentTooLarge": '"{name}" overskrider grensen på 10 MB.',
  },
  fi: {
    "greeting.title": "Hei",
    "greeting.subtitle": "Aloitetaan",
    "greeting.subtitleExtended":
      "Aloitetaan. Olemme täällä, kun tarvitset meitä.",
    "loading.default": "Ladataan...",
    "loading.findingOrg": "Etsitään organisaation tunnusta...",
    "loading.verifyingOrg": "Tarkistetaan organisaatiota...",
    "loading.findingSession": "Etsitään istunnon tunnusta...",
    "loading.validatingSession": "Tarkistetaan istuntoa...",
    "loading.loadingSettings": "Ladataan widgetin asetuksia...",
    "error.invalidConfig": "Virheellinen määritys",
    "error.missingOrgId": "Organisaation tunnus puuttuu",
    "error.unableVerify": "Organisaatiota ei voida vahvistaa",
    "error.missingOrgIdShort": "Organisaation tunnus vaaditaan",
    "auth.yourDetails": "Tietosi",
    "auth.nameLabel": "Nimi",
    "auth.namePlaceholder": "esim. Matti Meikäläinen",
    "auth.nameRequired": "Nimi vaaditaan",
    "auth.emailLabel": "Sähköposti",
    "auth.emailPlaceholder": "esim. matti@esimerkki.fi",
    "auth.emailInvalid": "Virheellinen sähköpostiosoite",
    "auth.continue": "Jatka",
    "selection.chatWithUs": "Keskustele kanssamme",
    "selection.oneMoment": "Hetkinen…",
    "selection.recentChats": "Viimeisimmät keskustelut",
    "selection.chat": "Keskustelu",
    "selection.signOutAria": "Kirjaudu ulos",
    "selection.signOutTitle": "Kirjaudu ulos",
    "selection.signOutDescription":
      "Haluatko varmasti kirjautua ulos? Sinun on annettava tietosi uudelleen aloittaaksesi uuden keskustelun.",
    "selection.cancel": "Peruuta",
    "selection.signOut": "Kirjaudu ulos",
    "chat.headerTitle": "Keskustelu",
    "chat.deleteConversationTitle": "Poista keskustelu",
    "chat.deleteConversationDescription":
      "Haluatko varmasti poistaa tämän keskustelun? Kaikki viestit ja liitteet poistetaan pysyvästi. Tätä toimintoa ei voi kumota.",
    "chat.cancel": "Peruuta",
    "chat.delete": "Poista",
    "chat.deleting": "Poistetaan...",
    "chat.attach": "Liitä",
    "chat.screenshot": "Kuvakaappaus",
    "chat.typeYourMessage": "Kirjoita viestisi...",
    "chat.conversationResolved": "Tämä keskustelu on ratkaistu.",
    "chat.screenshotNotEmbedded":
      "Sivustosi kuvakaappaukset ovat käytettävissä, kun chat on upotettu sivullesi.",
    "chat.screenshotTimedOut":
      "Kuvakaappaus aikakatkaistiin. Yritä uudelleen.",
    "chat.screenshotDataMissing": "Kuvakaappauksen tiedot puuttuivat.",
    "chat.screenshotFailedGeneric": "Kuvakaappaus epäonnistui.",
    "chat.attachmentTooLarge": '"{name}" ylittää 10 MB:n rajan.',
  },
  tr: {
    "greeting.title": "Merhaba",
    "greeting.subtitle": "Başlayalım",
    "greeting.subtitleExtended":
      "Başlayalım. Bize ihtiyacın olduğunda buradayız.",
    "loading.default": "Yükleniyor...",
    "loading.findingOrg": "Organizasyon kimliği bulunuyor...",
    "loading.verifyingOrg": "Organizasyon doğrulanıyor...",
    "loading.findingSession": "Oturum kimliği bulunuyor...",
    "loading.validatingSession": "Oturum doğrulanıyor...",
    "loading.loadingSettings": "Widget ayarları yükleniyor...",
    "error.invalidConfig": "Geçersiz yapılandırma",
    "error.missingOrgId": "Organizasyon kimliği eksik",
    "error.unableVerify": "Organizasyon doğrulanamıyor",
    "error.missingOrgIdShort": "Organizasyon kimliği gereklidir",
    "auth.yourDetails": "Bilgileriniz",
    "auth.nameLabel": "Ad",
    "auth.namePlaceholder": "örn. Ahmet Yılmaz",
    "auth.nameRequired": "Ad zorunludur",
    "auth.emailLabel": "E-posta",
    "auth.emailPlaceholder": "örn. ahmet@ornek.com",
    "auth.emailInvalid": "Geçersiz e-posta adresi",
    "auth.continue": "Devam et",
    "selection.chatWithUs": "Bizimle sohbet edin",
    "selection.oneMoment": "Bir an…",
    "selection.recentChats": "Son sohbetler",
    "selection.chat": "Sohbet",
    "selection.signOutAria": "Çıkış yap",
    "selection.signOutTitle": "Çıkış yap",
    "selection.signOutDescription":
      "Çıkış yapmak istediğinden emin misin? Yeni bir sohbet başlatmak için bilgilerini tekrar girmen gerekecek.",
    "selection.cancel": "İptal",
    "selection.signOut": "Çıkış yap",
    "chat.headerTitle": "Sohbet",
    "chat.deleteConversationTitle": "Sohbeti sil",
    "chat.deleteConversationDescription":
      "Bu sohbeti silmek istediğinden emin misin? Tüm mesajlar ve ekler kalıcı olarak silinecek. Bu işlem geri alınamaz.",
    "chat.cancel": "İptal",
    "chat.delete": "Sil",
    "chat.deleting": "Siliniyor...",
    "chat.attach": "Ekle",
    "chat.screenshot": "Ekran görüntüsü",
    "chat.typeYourMessage": "Mesajını yaz...",
    "chat.conversationResolved": "Bu sohbet çözüldü.",
    "chat.screenshotNotEmbedded":
      "Site ekran görüntüleri, sohbet sayfaya gömüldüğünde kullanılabilir.",
    "chat.screenshotTimedOut":
      "Ekran görüntüsü zaman aşımına uğradı. Tekrar dene.",
    "chat.screenshotDataMissing": "Ekran görüntüsü verisi eksikti.",
    "chat.screenshotFailedGeneric": "Ekran görüntüsü başarısız.",
    "chat.attachmentTooLarge": '"{name}" 10 MB sınırını aşıyor.',
  },
  ru: {
    "greeting.title": "Привет",
    "greeting.subtitle": "Давайте начнём",
    "greeting.subtitleExtended":
      "Давайте начнём. Мы здесь, когда мы нужны.",
    "loading.default": "Загрузка...",
    "loading.findingOrg": "Поиск идентификатора организации...",
    "loading.verifyingOrg": "Проверка организации...",
    "loading.findingSession": "Поиск идентификатора сессии...",
    "loading.validatingSession": "Проверка сессии...",
    "loading.loadingSettings": "Загрузка настроек виджета...",
    "error.invalidConfig": "Неверная конфигурация",
    "error.missingOrgId": "Отсутствует идентификатор организации",
    "error.unableVerify": "Не удалось проверить организацию",
    "error.missingOrgIdShort": "Требуется идентификатор организации",
    "auth.yourDetails": "Ваши данные",
    "auth.nameLabel": "Имя",
    "auth.namePlaceholder": "напр. Иван Иванов",
    "auth.nameRequired": "Имя обязательно",
    "auth.emailLabel": "Электронная почта",
    "auth.emailPlaceholder": "напр. ivan@primer.ru",
    "auth.emailInvalid": "Неверный адрес электронной почты",
    "auth.continue": "Продолжить",
    "selection.chatWithUs": "Написать нам",
    "selection.oneMoment": "Минутку…",
    "selection.recentChats": "Недавние чаты",
    "selection.chat": "Чат",
    "selection.signOutAria": "Выйти",
    "selection.signOutTitle": "Выйти",
    "selection.signOutDescription":
      "Вы уверены, что хотите выйти? Чтобы начать новый чат, нужно будет снова ввести свои данные.",
    "selection.cancel": "Отмена",
    "selection.signOut": "Выйти",
    "chat.headerTitle": "Чат",
    "chat.deleteConversationTitle": "Удалить беседу",
    "chat.deleteConversationDescription":
      "Вы уверены, что хотите удалить эту беседу? Все сообщения и вложения будут удалены без возможности восстановления.",
    "chat.cancel": "Отмена",
    "chat.delete": "Удалить",
    "chat.deleting": "Удаление...",
    "chat.attach": "Прикрепить",
    "chat.screenshot": "Скриншот",
    "chat.typeYourMessage": "Напишите сообщение...",
    "chat.conversationResolved": "Эта беседа разрешена.",
    "chat.screenshotNotEmbedded":
      "Скриншоты вашего сайта доступны, когда чат встроен на вашу страницу.",
    "chat.screenshotTimedOut":
      "Время ожидания скриншота истекло. Попробуйте ещё раз.",
    "chat.screenshotDataMissing": "Данные скриншота отсутствуют.",
    "chat.screenshotFailedGeneric": "Не удалось сделать скриншот.",
    "chat.attachmentTooLarge": '"{name}" превышает предел в 10 МБ.',
  },
  uk: {
    "greeting.title": "Привіт",
    "greeting.subtitle": "Розпочнімо",
    "greeting.subtitleExtended":
      "Розпочнімо. Ми тут, коли ми вам потрібні.",
    "loading.default": "Завантаження...",
    "loading.findingOrg": "Пошук ідентифікатора організації...",
    "loading.verifyingOrg": "Перевірка організації...",
    "loading.findingSession": "Пошук ідентифікатора сесії...",
    "loading.validatingSession": "Перевірка сесії...",
    "loading.loadingSettings": "Завантаження налаштувань віджета...",
    "error.invalidConfig": "Неправильна конфігурація",
    "error.missingOrgId": "Відсутній ідентифікатор організації",
    "error.unableVerify": "Не вдалося перевірити організацію",
    "error.missingOrgIdShort": "Потрібен ідентифікатор організації",
    "auth.yourDetails": "Ваші дані",
    "auth.nameLabel": "Ім'я",
    "auth.namePlaceholder": "напр. Іван Петренко",
    "auth.nameRequired": "Ім'я обов'язкове",
    "auth.emailLabel": "Електронна пошта",
    "auth.emailPlaceholder": "напр. ivan@priklad.ua",
    "auth.emailInvalid": "Неправильна адреса електронної пошти",
    "auth.continue": "Продовжити",
    "selection.chatWithUs": "Написати нам",
    "selection.oneMoment": "Хвилинку…",
    "selection.recentChats": "Нещодавні чати",
    "selection.chat": "Чат",
    "selection.signOutAria": "Вийти",
    "selection.signOutTitle": "Вийти",
    "selection.signOutDescription":
      "Ви впевнені, що хочете вийти? Щоб почати новий чат, потрібно буде знову ввести дані.",
    "selection.cancel": "Скасувати",
    "selection.signOut": "Вийти",
    "chat.headerTitle": "Чат",
    "chat.deleteConversationTitle": "Видалити розмову",
    "chat.deleteConversationDescription":
      "Ви впевнені, що хочете видалити цю розмову? Усі повідомлення та вкладення буде видалено назавжди.",
    "chat.cancel": "Скасувати",
    "chat.delete": "Видалити",
    "chat.deleting": "Видалення...",
    "chat.attach": "Прикріпити",
    "chat.screenshot": "Знімок",
    "chat.typeYourMessage": "Введіть повідомлення...",
    "chat.conversationResolved": "Цю розмову вирішено.",
    "chat.screenshotNotEmbedded":
      "Знімки вашого сайту доступні, коли чат вбудовано у сторінку.",
    "chat.screenshotTimedOut":
      "Час очікування знімка минув. Спробуйте ще раз.",
    "chat.screenshotDataMissing": "Бракує даних знімка.",
    "chat.screenshotFailedGeneric": "Не вдалося зробити знімок.",
    "chat.attachmentTooLarge": '"{name}" перевищує обмеження в 10 МБ.',
  },
  cs: {
    "greeting.title": "Ahoj",
    "greeting.subtitle": "Pojďme začít",
    "greeting.subtitleExtended": "Pojďme začít. Jsme tu, když nás potřebujete.",
    "loading.default": "Načítání...",
    "loading.findingOrg": "Hledání ID organizace...",
    "loading.verifyingOrg": "Ověřování organizace...",
    "loading.findingSession": "Hledání ID relace...",
    "loading.validatingSession": "Ověřování relace...",
    "loading.loadingSettings": "Načítání nastavení widgetu...",
    "error.invalidConfig": "Neplatná konfigurace",
    "error.missingOrgId": "Chybí ID organizace",
    "error.unableVerify": "Nelze ověřit organizaci",
    "error.missingOrgIdShort": "ID organizace je povinné",
    "auth.yourDetails": "Vaše údaje",
    "auth.nameLabel": "Jméno",
    "auth.namePlaceholder": "např. Jan Novák",
    "auth.nameRequired": "Jméno je povinné",
    "auth.emailLabel": "E-mail",
    "auth.emailPlaceholder": "např. jan.novak@priklad.cz",
    "auth.emailInvalid": "Neplatná e-mailová adresa",
    "auth.continue": "Pokračovat",
    "selection.chatWithUs": "Napište nám",
    "selection.oneMoment": "Okamžik…",
    "selection.recentChats": "Nedávné chaty",
    "selection.chat": "Chat",
    "selection.signOutAria": "Odhlásit se",
    "selection.signOutTitle": "Odhlásit se",
    "selection.signOutDescription":
      "Opravdu se chcete odhlásit? Pro zahájení nového chatu budete muset znovu zadat své údaje.",
    "selection.cancel": "Zrušit",
    "selection.signOut": "Odhlásit se",
    "chat.headerTitle": "Chat",
    "chat.deleteConversationTitle": "Smazat konverzaci",
    "chat.deleteConversationDescription":
      "Opravdu chcete smazat tuto konverzaci? Všechny zprávy a přílohy budou trvale odstraněny. Tuto akci nelze vrátit.",
    "chat.cancel": "Zrušit",
    "chat.delete": "Smazat",
    "chat.deleting": "Mazání...",
    "chat.attach": "Přiložit",
    "chat.screenshot": "Snímek",
    "chat.typeYourMessage": "Napište zprávu...",
    "chat.conversationResolved": "Tato konverzace byla vyřešena.",
    "chat.screenshotNotEmbedded":
      "Snímky vašich stránek jsou k dispozici, když je chat integrován na stránce.",
    "chat.screenshotTimedOut":
      "Časový limit snímku vypršel. Zkuste to znovu.",
    "chat.screenshotDataMissing": "Data snímku chybí.",
    "chat.screenshotFailedGeneric": "Snímek se nezdařil.",
    "chat.attachmentTooLarge": '"{name}" přesahuje limit 10 MB.',
  },
  el: {
    "greeting.title": "Γειά",
    "greeting.subtitle": "Ας ξεκινήσουμε",
    "greeting.subtitleExtended":
      "Ας ξεκινήσουμε. Είμαστε εδώ όποτε μας χρειαστείς.",
    "loading.default": "Φόρτωση...",
    "loading.findingOrg": "Αναζήτηση ID οργανισμού...",
    "loading.verifyingOrg": "Επαλήθευση οργανισμού...",
    "loading.findingSession": "Αναζήτηση ID συνεδρίας...",
    "loading.validatingSession": "Επαλήθευση συνεδρίας...",
    "loading.loadingSettings": "Φόρτωση ρυθμίσεων widget...",
    "error.invalidConfig": "Μη έγκυρη διαμόρφωση",
    "error.missingOrgId": "Λείπει το ID οργανισμού",
    "error.unableVerify": "Δεν ήταν δυνατή η επαλήθευση του οργανισμού",
    "error.missingOrgIdShort": "Απαιτείται ID οργανισμού",
    "auth.yourDetails": "Τα στοιχεία σου",
    "auth.nameLabel": "Όνομα",
    "auth.namePlaceholder": "π.χ. Γιώργος Παπαδόπουλος",
    "auth.nameRequired": "Το όνομα είναι υποχρεωτικό",
    "auth.emailLabel": "Email",
    "auth.emailPlaceholder": "π.χ. giorgos@paradeigma.gr",
    "auth.emailInvalid": "Μη έγκυρη διεύθυνση email",
    "auth.continue": "Συνέχεια",
    "selection.chatWithUs": "Μίλησε μαζί μας",
    "selection.oneMoment": "Μια στιγμή…",
    "selection.recentChats": "Πρόσφατες συνομιλίες",
    "selection.chat": "Συνομιλία",
    "selection.signOutAria": "Αποσύνδεση",
    "selection.signOutTitle": "Αποσύνδεση",
    "selection.signOutDescription":
      "Είσαι σίγουρος ότι θέλεις να αποσυνδεθείς; Θα χρειαστεί να ξαναεισάγεις τα στοιχεία σου για να ξεκινήσεις νέα συνομιλία.",
    "selection.cancel": "Άκυρο",
    "selection.signOut": "Αποσύνδεση",
    "chat.headerTitle": "Συνομιλία",
    "chat.deleteConversationTitle": "Διαγραφή συνομιλίας",
    "chat.deleteConversationDescription":
      "Είσαι σίγουρος ότι θέλεις να διαγράψεις αυτή τη συνομιλία; Όλα τα μηνύματα και οι συνημμένες διαγράφονται μόνιμα. Η ενέργεια δεν αναιρείται.",
    "chat.cancel": "Άκυρο",
    "chat.delete": "Διαγραφή",
    "chat.deleting": "Διαγραφή...",
    "chat.attach": "Επισύναψη",
    "chat.screenshot": "Στιγμιότυπο",
    "chat.typeYourMessage": "Γράψε το μήνυμά σου...",
    "chat.conversationResolved": "Αυτή η συνομιλία έχει επιλυθεί.",
    "chat.screenshotNotEmbedded":
      "Τα στιγμιότυπα του ιστότοπού σου είναι διαθέσιμα όταν η συνομιλία είναι ενσωματωμένη στη σελίδα.",
    "chat.screenshotTimedOut":
      "Το στιγμιότυπο έληξε. Δοκίμασε ξανά.",
    "chat.screenshotDataMissing": "Λείπουν τα δεδομένα του στιγμιότυπου.",
    "chat.screenshotFailedGeneric": "Αποτυχία στιγμιότυπου.",
    "chat.attachmentTooLarge": 'Το "{name}" υπερβαίνει το όριο των 10 MB.',
  },
  ar: {
    "greeting.title": "مرحبًا",
    "greeting.subtitle": "لنبدأ",
    "greeting.subtitleExtended": "لنبدأ. نحن هنا عندما تحتاجنا.",
    "loading.default": "جارٍ التحميل...",
    "loading.findingOrg": "جارٍ العثور على معرّف المؤسسة...",
    "loading.verifyingOrg": "جارٍ التحقق من المؤسسة...",
    "loading.findingSession": "جارٍ العثور على معرّف الجلسة...",
    "loading.validatingSession": "جارٍ التحقق من الجلسة...",
    "loading.loadingSettings": "جارٍ تحميل إعدادات الودجة...",
    "error.invalidConfig": "تكوين غير صالح",
    "error.missingOrgId": "معرّف المؤسسة مفقود",
    "error.unableVerify": "تعذّر التحقق من المؤسسة",
    "error.missingOrgIdShort": "معرّف المؤسسة مطلوب",
    "auth.yourDetails": "بياناتك",
    "auth.nameLabel": "الاسم",
    "auth.namePlaceholder": "مثال: أحمد علي",
    "auth.nameRequired": "الاسم مطلوب",
    "auth.emailLabel": "البريد الإلكتروني",
    "auth.emailPlaceholder": "مثال: ahmed@example.com",
    "auth.emailInvalid": "عنوان بريد إلكتروني غير صالح",
    "auth.continue": "متابعة",
    "selection.chatWithUs": "تحدّث معنا",
    "selection.oneMoment": "لحظة…",
    "selection.recentChats": "المحادثات الأخيرة",
    "selection.chat": "محادثة",
    "selection.signOutAria": "تسجيل الخروج",
    "selection.signOutTitle": "تسجيل الخروج",
    "selection.signOutDescription":
      "هل أنت متأكد من تسجيل الخروج؟ ستحتاج إلى إدخال بياناتك مرة أخرى لبدء محادثة جديدة.",
    "selection.cancel": "إلغاء",
    "selection.signOut": "تسجيل الخروج",
    "chat.headerTitle": "محادثة",
    "chat.deleteConversationTitle": "حذف المحادثة",
    "chat.deleteConversationDescription":
      "هل أنت متأكد من حذف هذه المحادثة؟ ستُحذف كل الرسائل والمرفقات نهائيًا ولا يمكن التراجع.",
    "chat.cancel": "إلغاء",
    "chat.delete": "حذف",
    "chat.deleting": "جارٍ الحذف...",
    "chat.attach": "إرفاق",
    "chat.screenshot": "لقطة شاشة",
    "chat.typeYourMessage": "اكتب رسالتك...",
    "chat.conversationResolved": "تم حل هذه المحادثة.",
    "chat.screenshotNotEmbedded":
      "تتوفر لقطات موقعك عندما يكون الدردشة مدمجة في صفحتك.",
    "chat.screenshotTimedOut": "انتهت مهلة اللقطة. حاول مجددًا.",
    "chat.screenshotDataMissing": "بيانات اللقطة مفقودة.",
    "chat.screenshotFailedGeneric": "فشلت اللقطة.",
    "chat.attachmentTooLarge": 'يتجاوز "{name}" حد 10 ميجابايت.',
  },
  he: {
    "greeting.title": "שלום",
    "greeting.subtitle": "בואו נתחיל",
    "greeting.subtitleExtended": "בואו נתחיל. אנחנו כאן כשאתם צריכים אותנו.",
    "loading.default": "טוען...",
    "loading.findingOrg": "מאתר מזהה ארגון...",
    "loading.verifyingOrg": "מאמת ארגון...",
    "loading.findingSession": "מאתר מזהה הפעלה...",
    "loading.validatingSession": "מאמת הפעלה...",
    "loading.loadingSettings": "טוען הגדרות ווידג'ט...",
    "error.invalidConfig": "הגדרה לא חוקית",
    "error.missingOrgId": "חסר מזהה ארגון",
    "error.unableVerify": "לא ניתן לאמת את הארגון",
    "error.missingOrgIdShort": "נדרש מזהה ארגון",
    "auth.yourDetails": "הפרטים שלך",
    "auth.nameLabel": "שם",
    "auth.namePlaceholder": "למשל: ישראל ישראלי",
    "auth.nameRequired": "שם נדרש",
    "auth.emailLabel": "אימייל",
    "auth.emailPlaceholder": "למשל: user@example.com",
    "auth.emailInvalid": "כתובת אימייל לא חוקית",
    "auth.continue": "המשך",
    "selection.chatWithUs": "צ'אט איתנו",
    "selection.oneMoment": "רגע…",
    "selection.recentChats": "צ'אטים אחרונים",
    "selection.chat": "צ'אט",
    "selection.signOutAria": "התנתק",
    "selection.signOutTitle": "התנתק",
    "selection.signOutDescription":
      "האם אתה בטוח שברצונך להתנתק? תצטרך להזין את הפרטים שוב כדי להתחיל צ'אט חדש.",
    "selection.cancel": "ביטול",
    "selection.signOut": "התנתק",
    "chat.headerTitle": "צ'אט",
    "chat.deleteConversationTitle": "מחק שיחה",
    "chat.deleteConversationDescription":
      "האם אתה בטוח שברצונך למחוק שיחה זו? כל ההודעות והקבצים יוסרו לצמיתות. לא ניתן לבטל פעולה זו.",
    "chat.cancel": "ביטול",
    "chat.delete": "מחק",
    "chat.deleting": "מוחק...",
    "chat.attach": "צרף",
    "chat.screenshot": "צילום מסך",
    "chat.typeYourMessage": "הקלד את ההודעה שלך...",
    "chat.conversationResolved": "שיחה זו נפתרה.",
    "chat.screenshotNotEmbedded":
      "צילומי מסך של האתר זמינים כאשר הצ'אט משובץ בדף שלך.",
    "chat.screenshotTimedOut": "תם הזמן של צילום המסך. נסה שוב.",
    "chat.screenshotDataMissing": "נתוני צילום המסך חסרים.",
    "chat.screenshotFailedGeneric": "צילום המסך נכשל.",
    "chat.attachmentTooLarge": '"{name}" חורג מהמגבלה של 10 MB.',
  },
  hi: {
    "greeting.title": "नमस्ते",
    "greeting.subtitle": "चलिए शुरू करें",
    "greeting.subtitleExtended":
      "चलिए शुरू करें। जब आपको ज़रूरत हो, हम यहाँ हैं।",
    "loading.default": "लोड हो रहा है...",
    "loading.findingOrg": "संगठन आईडी ढूंढी जा रही है...",
    "loading.verifyingOrg": "संगठन सत्यापित हो रहा है...",
    "loading.findingSession": "सत्र आईडी ढूंढी जा रही है...",
    "loading.validatingSession": "सत्र सत्यापित हो रहा है...",
    "loading.loadingSettings": "विजेट सेटिंग्स लोड हो रही हैं...",
    "error.invalidConfig": "अमान्य कॉन्फ़िगरेशन",
    "error.missingOrgId": "संगठन आईडी गुम है",
    "error.unableVerify": "संगठन सत्यापित नहीं किया जा सका",
    "error.missingOrgIdShort": "संगठन आईडी आवश्यक है",
    "auth.yourDetails": "आपकी जानकारी",
    "auth.nameLabel": "नाम",
    "auth.namePlaceholder": "जैसे: राहुल शर्मा",
    "auth.nameRequired": "नाम आवश्यक है",
    "auth.emailLabel": "ईमेल",
    "auth.emailPlaceholder": "जैसे: rahul@example.com",
    "auth.emailInvalid": "अमान्य ईमेल पता",
    "auth.continue": "जारी रखें",
    "selection.chatWithUs": "हमसे बात करें",
    "selection.oneMoment": "एक पल…",
    "selection.recentChats": "हाल की चैट्स",
    "selection.chat": "चैट",
    "selection.signOutAria": "साइन आउट",
    "selection.signOutTitle": "साइन आउट",
    "selection.signOutDescription":
      "क्या आप वाकई साइन आउट करना चाहते हैं? नई चैट शुरू करने के लिए आपको अपनी जानकारी फिर से दर्ज करनी होगी।",
    "selection.cancel": "रद्द करें",
    "selection.signOut": "साइन आउट",
    "chat.headerTitle": "चैट",
    "chat.deleteConversationTitle": "बातचीत हटाएँ",
    "chat.deleteConversationDescription":
      "क्या आप वाकई इस बातचीत को हटाना चाहते हैं? सभी संदेश और अनुलग्नक स्थायी रूप से हटा दिए जाएंगे। इस क्रिया को पूर्ववत नहीं किया जा सकता।",
    "chat.cancel": "रद्द करें",
    "chat.delete": "हटाएँ",
    "chat.deleting": "हटाया जा रहा है...",
    "chat.attach": "संलग्न करें",
    "chat.screenshot": "स्क्रीनशॉट",
    "chat.typeYourMessage": "अपना संदेश लिखें...",
    "chat.conversationResolved": "यह बातचीत हल हो गई है।",
    "chat.screenshotNotEmbedded":
      "आपकी साइट के स्क्रीनशॉट तब उपलब्ध होते हैं जब चैट आपके पेज पर एम्बेडेड होती है।",
    "chat.screenshotTimedOut":
      "स्क्रीनशॉट का समय समाप्त हुआ। पुनः प्रयास करें।",
    "chat.screenshotDataMissing": "स्क्रीनशॉट डेटा गायब था।",
    "chat.screenshotFailedGeneric": "स्क्रीनशॉट विफल रहा।",
    "chat.attachmentTooLarge": '"{name}" 10 MB की सीमा से अधिक है।',
  },
  ja: {
    "greeting.title": "こんにちは",
    "greeting.subtitle": "はじめましょう",
    "greeting.subtitleExtended":
      "はじめましょう。必要なときにここにいます。",
    "loading.default": "読み込み中...",
    "loading.findingOrg": "組織IDを検索中...",
    "loading.verifyingOrg": "組織を確認中...",
    "loading.findingSession": "セッションIDを検索中...",
    "loading.validatingSession": "セッションを確認中...",
    "loading.loadingSettings": "ウィジェット設定を読み込み中...",
    "error.invalidConfig": "無効な構成です",
    "error.missingOrgId": "組織IDがありません",
    "error.unableVerify": "組織を確認できません",
    "error.missingOrgIdShort": "組織IDが必要です",
    "auth.yourDetails": "あなたの情報",
    "auth.nameLabel": "名前",
    "auth.namePlaceholder": "例：山田太郎",
    "auth.nameRequired": "名前は必須です",
    "auth.emailLabel": "メール",
    "auth.emailPlaceholder": "例：yamada@example.com",
    "auth.emailInvalid": "無効なメールアドレスです",
    "auth.continue": "続ける",
    "selection.chatWithUs": "チャットを始める",
    "selection.oneMoment": "しばらくお待ちください…",
    "selection.recentChats": "最近のチャット",
    "selection.chat": "チャット",
    "selection.signOutAria": "サインアウト",
    "selection.signOutTitle": "サインアウト",
    "selection.signOutDescription":
      "サインアウトしますか？新しいチャットを開始するには、もう一度情報を入力する必要があります。",
    "selection.cancel": "キャンセル",
    "selection.signOut": "サインアウト",
    "chat.headerTitle": "チャット",
    "chat.deleteConversationTitle": "会話を削除",
    "chat.deleteConversationDescription":
      "この会話を削除しますか？すべてのメッセージと添付ファイルは完全に削除されます。この操作は取り消せません。",
    "chat.cancel": "キャンセル",
    "chat.delete": "削除",
    "chat.deleting": "削除中...",
    "chat.attach": "添付",
    "chat.screenshot": "スクリーンショット",
    "chat.typeYourMessage": "メッセージを入力...",
    "chat.conversationResolved": "この会話は解決済みです。",
    "chat.screenshotNotEmbedded":
      "サイトのスクリーンショットは、チャットがページに埋め込まれている場合に利用できます。",
    "chat.screenshotTimedOut":
      "スクリーンショットがタイムアウトしました。再試行してください。",
    "chat.screenshotDataMissing": "スクリーンショットのデータがありません。",
    "chat.screenshotFailedGeneric": "スクリーンショットに失敗しました。",
    "chat.attachmentTooLarge": '"{name}" は10 MBの上限を超えています。',
  },
  ko: {
    "greeting.title": "안녕하세요",
    "greeting.subtitle": "시작해볼까요",
    "greeting.subtitleExtended":
      "시작해볼까요. 필요할 때 저희가 도와드립니다.",
    "loading.default": "불러오는 중...",
    "loading.findingOrg": "조직 ID를 찾는 중...",
    "loading.verifyingOrg": "조직을 확인하는 중...",
    "loading.findingSession": "세션 ID를 찾는 중...",
    "loading.validatingSession": "세션을 확인하는 중...",
    "loading.loadingSettings": "위젯 설정을 불러오는 중...",
    "error.invalidConfig": "잘못된 구성",
    "error.missingOrgId": "조직 ID가 없습니다",
    "error.unableVerify": "조직을 확인할 수 없습니다",
    "error.missingOrgIdShort": "조직 ID가 필요합니다",
    "auth.yourDetails": "정보",
    "auth.nameLabel": "이름",
    "auth.namePlaceholder": "예: 홍길동",
    "auth.nameRequired": "이름은 필수입니다",
    "auth.emailLabel": "이메일",
    "auth.emailPlaceholder": "예: hong@example.com",
    "auth.emailInvalid": "유효하지 않은 이메일 주소",
    "auth.continue": "계속",
    "selection.chatWithUs": "채팅 시작하기",
    "selection.oneMoment": "잠시만요…",
    "selection.recentChats": "최근 채팅",
    "selection.chat": "채팅",
    "selection.signOutAria": "로그아웃",
    "selection.signOutTitle": "로그아웃",
    "selection.signOutDescription":
      "정말 로그아웃하시겠습니까? 새 채팅을 시작하려면 정보를 다시 입력해야 합니다.",
    "selection.cancel": "취소",
    "selection.signOut": "로그아웃",
    "chat.headerTitle": "채팅",
    "chat.deleteConversationTitle": "대화 삭제",
    "chat.deleteConversationDescription":
      "이 대화를 삭제하시겠습니까? 모든 메시지와 첨부 파일이 영구적으로 삭제됩니다. 실행 취소할 수 없습니다.",
    "chat.cancel": "취소",
    "chat.delete": "삭제",
    "chat.deleting": "삭제 중...",
    "chat.attach": "첨부",
    "chat.screenshot": "스크린샷",
    "chat.typeYourMessage": "메시지 입력...",
    "chat.conversationResolved": "이 대화가 해결되었습니다.",
    "chat.screenshotNotEmbedded":
      "사이트의 스크린샷은 채팅이 페이지에 삽입되어 있을 때 사용할 수 있습니다.",
    "chat.screenshotTimedOut":
      "스크린샷 시간이 초과되었습니다. 다시 시도하세요.",
    "chat.screenshotDataMissing": "스크린샷 데이터가 없습니다.",
    "chat.screenshotFailedGeneric": "스크린샷 실패.",
    "chat.attachmentTooLarge": '"{name}"이(가) 10MB 제한을 초과합니다.',
  },
  zh: {
    "greeting.title": "你好",
    "greeting.subtitle": "让我们开始吧",
    "greeting.subtitleExtended": "让我们开始吧。需要时我们都在。",
    "loading.default": "加载中...",
    "loading.findingOrg": "正在查找组织 ID...",
    "loading.verifyingOrg": "正在验证组织...",
    "loading.findingSession": "正在查找会话 ID...",
    "loading.validatingSession": "正在验证会话...",
    "loading.loadingSettings": "正在加载小组件设置...",
    "error.invalidConfig": "配置无效",
    "error.missingOrgId": "缺少组织 ID",
    "error.unableVerify": "无法验证组织",
    "error.missingOrgIdShort": "需要组织 ID",
    "auth.yourDetails": "您的信息",
    "auth.nameLabel": "姓名",
    "auth.namePlaceholder": "例如：张三",
    "auth.nameRequired": "姓名是必填项",
    "auth.emailLabel": "电子邮件",
    "auth.emailPlaceholder": "例如：zhang@example.com",
    "auth.emailInvalid": "无效的电子邮件地址",
    "auth.continue": "继续",
    "selection.chatWithUs": "与我们聊天",
    "selection.oneMoment": "稍等…",
    "selection.recentChats": "最近聊天",
    "selection.chat": "聊天",
    "selection.signOutAria": "退出登录",
    "selection.signOutTitle": "退出登录",
    "selection.signOutDescription":
      "确定要退出登录吗？要开始新的聊天，您需要再次输入信息。",
    "selection.cancel": "取消",
    "selection.signOut": "退出登录",
    "chat.headerTitle": "聊天",
    "chat.deleteConversationTitle": "删除对话",
    "chat.deleteConversationDescription":
      "确定要删除此对话吗？所有消息和附件将被永久删除。此操作无法撤销。",
    "chat.cancel": "取消",
    "chat.delete": "删除",
    "chat.deleting": "删除中...",
    "chat.attach": "附加",
    "chat.screenshot": "截图",
    "chat.typeYourMessage": "输入消息...",
    "chat.conversationResolved": "此对话已解决。",
    "chat.screenshotNotEmbedded": "当聊天嵌入到您的页面时，可获取您网站的截图。",
    "chat.screenshotTimedOut": "截图超时，请重试。",
    "chat.screenshotDataMissing": "截图数据缺失。",
    "chat.screenshotFailedGeneric": "截图失败。",
    "chat.attachmentTooLarge": "“{name}” 超过 10 MB 的限制。",
  },
  "zh-TW": {
    "greeting.title": "你好",
    "greeting.subtitle": "讓我們開始吧",
    "greeting.subtitleExtended": "讓我們開始吧。需要時我們隨時在。",
    "loading.default": "載入中...",
    "loading.findingOrg": "正在尋找組織 ID...",
    "loading.verifyingOrg": "正在驗證組織...",
    "loading.findingSession": "正在尋找工作階段 ID...",
    "loading.validatingSession": "正在驗證工作階段...",
    "loading.loadingSettings": "正在載入小工具設定...",
    "error.invalidConfig": "設定無效",
    "error.missingOrgId": "缺少組織 ID",
    "error.unableVerify": "無法驗證組織",
    "error.missingOrgIdShort": "需要組織 ID",
    "auth.yourDetails": "您的資料",
    "auth.nameLabel": "姓名",
    "auth.namePlaceholder": "例如：張三",
    "auth.nameRequired": "姓名為必填項",
    "auth.emailLabel": "電子郵件",
    "auth.emailPlaceholder": "例如：zhang@example.com",
    "auth.emailInvalid": "無效的電子郵件地址",
    "auth.continue": "繼續",
    "selection.chatWithUs": "與我們聊天",
    "selection.oneMoment": "稍候…",
    "selection.recentChats": "最近聊天",
    "selection.chat": "聊天",
    "selection.signOutAria": "登出",
    "selection.signOutTitle": "登出",
    "selection.signOutDescription":
      "確定要登出嗎？若要開始新的聊天，您需要重新輸入資料。",
    "selection.cancel": "取消",
    "selection.signOut": "登出",
    "chat.headerTitle": "聊天",
    "chat.deleteConversationTitle": "刪除對話",
    "chat.deleteConversationDescription":
      "確定要刪除此對話嗎？所有訊息和附件將永久移除。此操作無法復原。",
    "chat.cancel": "取消",
    "chat.delete": "刪除",
    "chat.deleting": "刪除中...",
    "chat.attach": "附加",
    "chat.screenshot": "螢幕截圖",
    "chat.typeYourMessage": "輸入訊息...",
    "chat.conversationResolved": "此對話已解決。",
    "chat.screenshotNotEmbedded":
      "當聊天嵌入您的頁面時，可取得您網站的螢幕截圖。",
    "chat.screenshotTimedOut": "螢幕截圖逾時，請重試。",
    "chat.screenshotDataMissing": "螢幕截圖資料缺失。",
    "chat.screenshotFailedGeneric": "螢幕截圖失敗。",
    "chat.attachmentTooLarge": '"{name}" 超過 10 MB 的限制。',
  },
};

/** Normalize a BCP-47 tag to the canonical form we store in our tables. */
function normalizeLanguageTag(tag: string): string {
  const trimmed = tag.trim();
  if (!trimmed) return "";
  const [primary, ...rest] = trimmed.split("-");
  if (!primary) return "";
  if (rest.length === 0) return primary.toLowerCase();
  return `${primary.toLowerCase()}-${rest.join("-").toUpperCase()}`;
}

/**
 * Pick the best matching language tag from `available` for the user's
 * requested tag(s). Returns the canonical stored value from `available`.
 *
 * Match order:
 *   1. Exact canonical match (e.g. "pt-BR" → "pt-BR")
 *   2. Primary subtag match (e.g. "pt-PT" → "pt")
 *   3. `fallback` if present in `available`
 *   4. First entry in `available`
 *   5. {@link DEFAULT_WIDGET_LANGUAGE}
 */
export function pickBestLanguage(
  requested: readonly string[] | string | null | undefined,
  available: readonly string[],
  fallback?: string,
): string {
  if (available.length === 0) return fallback ?? DEFAULT_WIDGET_LANGUAGE;

  const normAvailable = available.map(normalizeLanguageTag).filter(Boolean);
  const availableSet = new Set(normAvailable);
  const availablePrimaryMap = new Map<string, string>();
  for (const tag of normAvailable) {
    const primary = tag.split("-")[0] ?? tag;
    if (!availablePrimaryMap.has(primary)) {
      availablePrimaryMap.set(primary, tag);
    }
  }

  const requestedList = Array.isArray(requested)
    ? requested
    : requested
    ? [requested]
    : [];

  for (const raw of requestedList) {
    const canonical = normalizeLanguageTag(raw);
    if (!canonical) continue;
    if (availableSet.has(canonical)) {
      const match = available[normAvailable.indexOf(canonical)];
      if (match) return match;
    }
    const primary = canonical.split("-")[0] ?? canonical;
    const primaryMatch = availablePrimaryMap.get(primary);
    if (primaryMatch) {
      const match = available[normAvailable.indexOf(primaryMatch)];
      if (match) return match;
    }
  }

  if (fallback) {
    const canonicalFb = normalizeLanguageTag(fallback);
    if (availableSet.has(canonicalFb)) {
      const match = available[normAvailable.indexOf(canonicalFb)];
      if (match) return match;
    }
    const primaryFb = canonicalFb.split("-")[0] ?? canonicalFb;
    const primaryMatch = availablePrimaryMap.get(primaryFb);
    if (primaryMatch) {
      const match = available[normAvailable.indexOf(primaryMatch)];
      if (match) return match;
    }
  }

  return available[0] ?? fallback ?? DEFAULT_WIDGET_LANGUAGE;
}

/**
 * Returns the UI string bundle for the best match of `language`, with
 * English guaranteed as the ultimate fallback. Unlike {@link pickBestLanguage}
 * this is for the widget's hardcoded chrome text — it never has to agree
 * with the admin-configured language list.
 */
export function getWidgetStringsForLanguage(
  language: string | null | undefined,
): WidgetStrings {
  const availableTags = Object.keys(WIDGET_UI_STRINGS);
  const bestTag = pickBestLanguage(
    language,
    availableTags,
    DEFAULT_WIDGET_LANGUAGE,
  );
  return WIDGET_UI_STRINGS[bestTag] ?? WIDGET_UI_STRINGS[DEFAULT_WIDGET_LANGUAGE]!;
}

/** Replace {name}-style placeholders in translated strings. */
export function formatWidgetString(
  template: string,
  vars: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    key in vars ? String(vars[key]) : `{${key}}`,
  );
}

/** Detect the best UI language from `navigator` (safe in SSR — returns default). */
export function detectNavigatorLanguage(fallback?: string): string {
  if (typeof navigator === "undefined") {
    return fallback ?? DEFAULT_WIDGET_LANGUAGE;
  }
  const languages =
    Array.isArray(navigator.languages) && navigator.languages.length > 0
      ? navigator.languages
      : [navigator.language];
  return pickBestLanguage(
    languages,
    Object.keys(WIDGET_UI_STRINGS),
    fallback ?? DEFAULT_WIDGET_LANGUAGE,
  );
}
