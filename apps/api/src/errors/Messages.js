
const { register } = require('./UHGError');

const Messages = {
  INVALID_TYPE: (name, expected, an = false) => `Supplied ${name} is not a${an ? 'n' : ''} ${expected}.`,

  API_KEY_INVALIDE: (key="") => 'An invalid Hypixel API key was provided. ' + key,
  API_KEY_MISSING: 'Request to use API key, but no API key was found.',
  API_KEY_COUNT: (original, after) => `Only ${after} from ${original} API keys ${after > 1 ? 'are' : 'is'} string`,
  API_KEY_NOT_WORKING: `0 API keys are working`,
};

for (const [name, message] of Object.entries(Messages)) register(name, message);
