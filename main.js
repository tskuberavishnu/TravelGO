// WARNING: Client-side API key is insecure for production. Use server-side for real apps.
const API_KEY = "AIzaSyAP7VOyDFYt97eVE5RMKLIJrlqzl9GXpXo"; // Replace with Google AI Studio API key
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

// DOM Elements (shared and page-specific)
const isChatbotPage = window.location.pathname.includes('chatbot.html');
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.querySelector('header');
const themeToggle = document.getElementById('theme-toggle');
const destinationCards = document.querySelectorAll('.destination-card');
const destinationSearch = document.getElementById('destination-search');
const searchClear = document.getElementById('search-clear');
const destinationContent = document.getElementById('destination-content');
const contentTitle = document.getElementById('content-title');
const contentDetails = document.getElementById('content-details');
const contentClear = document.getElementById('content-clear');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotSend = document.getElementById('chatbot-send');

// Chat history
let chatHistory = [];

// Fallback destinations
const destinations = {
  'paris': {
    name: '**Paris**, France',
    attractions: ['**Eiffel Tower**: Iconic landmark with panoramic views.', '**Louvre Museum**: World’s largest art museum.', '**Notre-Dame Cathedral**: Gothic masterpiece.'],
    dining: ['**Le Café de Flore**: Historic café with French classics.', '**Chez Janou**: Provençal dishes and pastis.', '**Le Meurice**: Michelin-starred fine dining.'],
    tips: 'Book **Louvre** tickets online to skip lines. Visit **Eiffel Tower** at night for the light show.',
    bestTime: 'April-May or September-October for mild weather.'
  },
  'santorini': {
    name: '**Santorini**, Greece',
    attractions: ['**Oia**: Stunning sunsets and whitewashed buildings.', '**Fira**: Vibrant town with cliffside views.', '**Akrotiri**: Ancient ruins.'],
    dining: ['**Selene**: Gourmet Cycladic cuisine.', '**Amoudi Bay**: Fresh seafood by the sea.', '**Karma**: Cozy spot with sunset views.'],
    tips: 'Stay in **Oia** for sunset views. Rent a scooter for easy exploration.',
    bestTime: 'May or September-October for fewer crowds.'
  },
  'kyoto': {
    name: '**Kyoto**, Japan',
    attractions: ['**Fushimi Inari Shrine**: Iconic red torii gates.', '**Kinkaku-ji**: Golden temple.', '**Arashiyama Bamboo Grove**: Serene forest path.'],
    dining: ['**Gion Karyo**: Traditional kaiseki dining.', '**Okutan**: Tofu specialties.', '**Nishiki Market**: Street food galore.'],
    tips: 'Visit during cherry blossom season (March-April). Wear comfy shoes for temple walks.',
    bestTime: 'March-April or November for seasonal beauty.'
  },
  'new york': {
    name: '**New York**, USA',
    attractions: ['**Statue of Liberty**: Symbol of freedom.', '**Central Park**: Urban oasis.', '**Times Square**: Neon-lit hub.'],
    dining: ['**Katz’s Delicatessen**: Famous pastrami sandwiches.', '**Joe’s Pizza**: Classic NY slice.', '**Le Bernardin**: Seafood fine dining.'],
    tips: 'Use the subway to save money. Book **Broadway** tickets early.',
    bestTime: 'September-November for crisp weather.'
  },
  'machu picchu': {
    name: '**Machu Picchu**, Peru',
    attractions: ['**Sun Gate**: Scenic sunrise spot.', '**Temple of the Sun**: Precise stonework.', '**Huayna Picchu**: Steep hike with views.'],
    dining: ['**Indio Feliz**: French-Peruvian fusion.', '**Toto’s House**: Local dishes in Aguas Calientes.', '**Mapacho**: Craft beer and Andean food.'],
    tips: 'Book tickets months in advance. Take the train to **Aguas Calientes**.',
    bestTime: 'May-September for dry trails.'
  },
  'rome': {
    name: '**Rome**, Italy',
    attractions: ['**Colosseum**: Ancient gladiator arena.', '**Pantheon**: Historic dome.', '**Trevi Fountain**: Iconic fountain.'],
    dining: ['**Roscioli**: Pasta and wine.', '**Giggetto**: Roman-Jewish cuisine.', '**Gelateria del Teatro**: Artisanal gelato.'],
    tips: 'Visit **Colosseum** at dusk to avoid crowds. Wear comfy shoes for cobblestones.',
    bestTime: 'April-May or October for mild weather.'
  },
  'bangkok': {
    name: '**Bangkok**, Thailand',
    attractions: ['**Grand Palace**: Royal complex.', '**Wat Arun**: Riverside temple.', '**Chatuchak Market**: Massive weekend market.'],
    dining: ['**Jay Fai**: Michelin-starred street food.', '**Savoey**: Thai classics.', '**Chinatown**: Night market eats.'],
    tips: 'Negotiate tuk-tuk fares upfront. Dress respectfully for temples.',
    bestTime: 'November-February for cooler weather.'
  },
  'cape town': {
    name: '**Cape Town**, South Africa',
    attractions: ['**Table Mountain**: Scenic cable car.', '**Robben Island**: Historic prison.', '**V&A Waterfront**: Shopping and dining.'],
    dining: ['**The Test Kitchen**: Innovative cuisine.', '**Kloof Street House**: Local flavors.', '**Mzoli’s**: Township BBQ.'],
    tips: 'Hike **Table Mountain** early. Book **Robben Island** tours in advance.',
    bestTime: 'December-March for sunny days.'
  },
  'bali': {
    name: '**Bali**, Indonesia',
    attractions: ['**Uluwatu Temple**: Cliffside sunset views.', '**Tegalalang Rice Terraces**: Green fields.', '**Seminyak Beach**: Surf and nightlife.'],
    dining: ['**Locavore**: Farm-to-table Balinese.', '**Warung Eny**: Budget local eats.', '**Eat Street**: Seafood and cocktails.'],
    tips: 'Respect temple dress codes. Rent a scooter for mobility.',
    bestTime: 'April-October for dry weather.'
  },
  'dubai': {
    name: '**Dubai**, UAE',
    attractions: ['**Burj Khalifa**: World’s tallest building.', '**Dubai Mall**: Shopping and entertainment.', '**Desert Safari**: Dune adventures.'],
    dining: ['**Pierchic**: Seafood with sea views.', '**Ravi**: Budget Pakistani curry.', '**Al Dawaar**: Revolving restaurant.'],
    tips: 'Book **Burj Khalifa** tickets early. Dress modestly in public.',
    bestTime: 'November-March for cooler temperatures.'
  },
  'reykjavik': {
    name: '**Reykjavik**, Iceland',
    attractions: ['**Hallgrimskirkja**: Iconic church.', '**Blue Lagoon**: Geothermal spa.', '**Golden Circle**: Geysers and waterfalls.'],
    dining: ['**Sandholt Bakery**: Pastries and coffee.', '**Icelandic Street Food**: Soup in bread bowls.', '**Dill**: Nordic fine dining.'],
    tips: 'Pack layers for weather changes. Book northern lights tours early.',
    bestTime: 'September-March for aurora viewing.'
  },
  'rio de janeiro': {
    name: '**Rio de Janeiro**, Brazil',
    attractions: ['**Christ the Redeemer**: Iconic statue.', '**Copacabana Beach**: Vibrant shoreline.', '**Sugarloaf Mountain**: Cable car views.'],
    dining: ['**Churrascaria Palace**: Brazilian BBQ.', '**Confeitaria Colombo**: Historic pastries.', '**Aprazível**: Hilltop dining.'],
    tips: 'Stay vigilant in crowds. Visit during **Carnival** for festivities.',
    bestTime: 'April-May for milder weather.'
  }
};

// Fallback topics
const tourismTopics = {
  'travel tips': 'Pack light, save digital copies of documents, learn local phrases, use offline maps.',
  'budget travel': 'Book flights early, stay in hostels, eat at street stalls, use public transport.',
  'safety': 'Use a money belt, avoid sharing plans online, research scams, save emergency numbers.',
  'culture': 'Respect dress codes, ask before photographing locals, check tipping norms, try local foods.',
  'activities': 'Hike trails, visit museums, join food tours, try adventures like snorkeling.',
  'sustainable travel': 'Use reusable bottles, support local businesses, walk or use public transport.',
  'solo travel': 'Join group tours, stay in hostels, share plans with family, trust instincts.',
  'family travel': 'Choose kid-friendly hotels, plan short activities, pack snacks, find free museum days.'
};

// Header scroll (index.html)
if (header && !isChatbotPage) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('bg-opacity-100', window.scrollY > 50);
    header.classList.toggle('py-2', window.scrollY > 50);
  });
}

// Mobile menu (index.html)
if (menuBtn && mobileMenu) {
  menuBtn.addEventListener('click', () => {
    const expanded = menuBtn.getAttribute('aria-expanded') === 'true';
    menuBtn.setAttribute('aria-expanded', !expanded);
    mobileMenu.classList.toggle('hidden');
    const icon = menuBtn.querySelector('i');
    icon.classList.toggle('fa-bars', !expanded);
    icon.classList.toggle('fa-times', expanded);
  });

  document.querySelectorAll('#mobile-menu a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenu.classList.add('hidden');
      menuBtn.setAttribute('aria-expanded', 'false');
      menuBtn.querySelector('i').classList.replace('fa-times', 'fa-bars');
    });
  });
}

// Smooth scrolling (index.html)
if (!isChatbotPage) {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = anchor.getAttribute('href');
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - header.offsetHeight,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Theme toggle
if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    const isLightMode = document.body.classList.contains('light-mode');
    themeToggle.querySelector('i').classList.toggle('fa-moon', !isLightMode);
    themeToggle.querySelector('i').classList.toggle('fa-sun', isLightMode);
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
  });

  if (localStorage.getItem('theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('i').classList.replace('fa-moon', 'fa-sun');
  }
}

// Destination search (index.html)
if (destinationSearch && searchClear) {
  destinationSearch.addEventListener('input', () => {
    const query = destinationSearch.value.toLowerCase();
    destinationCards.forEach((card, index) => {
      const destination = card.getAttribute('data-destination').toLowerCase();
      card.style.display = destination.includes(query) ? 'block' : 'none';
      card.style.setProperty('--index', index);
    });
  });

  searchClear.addEventListener('click', () => {
    destinationSearch.value = '';
    destinationCards.forEach((card, index) => {
      card.style.display = 'block';
      card.style.setProperty('--index', index);
    });
  });
}

// Chatbot toggle (index.html)
if (chatbotToggle) {
  chatbotToggle.addEventListener('click', () => {
    console.log('Chatbot toggle clicked: Redirecting to chatbot.html'); // Debug
    window.location.href = 'chatbot.html';
  });
}

// Display destination content (index.html)
function displayDestinationContent(destinationKey) {
  const destination = destinations[destinationKey];
  if (!destination) return;

  contentTitle.textContent = destination.name.replace(/\*\*/g, '');
  contentDetails.innerHTML = `
    <h4 class="text-lg font-semibold mb-2">Attractions</h4>
    <ul>${destination.attractions.map(attr => `<li>${attr.replace(/\*\*/g, '')}</li>`).join('')}</ul>
    <h4 class="text-lg font-semibold mt-4 mb-2">Dining</h4>
    <ul>${destination.dining.map(dine => `<li>${dine.replace(/\*\*/g, '')}</li>`).join('')}</ul>
    <h4 class="text-lg font-semibold mt-4 mb-2">Tips</h4>
    <p>${destination.tips.replace(/\*\*/g, '')}</p>
    <h4 class="text-lg font-semibold mt-4 mb-2">Best Time to Visit</h4>
    <p>${destination.bestTime}</p>
  `;
  destinationContent.classList.remove('hidden');
  destinationContent.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

if (contentClear) {
  contentClear.addEventListener('click', () => {
    destinationContent.classList.add('hidden');
    contentTitle.textContent = '';
    contentDetails.innerHTML = '';
  });
}

// Chatbot (chatbot.html)
function addMessage(content, isUser = false) {
  if (!chatbotMessages) return;
  const message = document.createElement('div');
  message.classList.add('chatbot-message', isUser ? 'user' : 'bot');
  content = content.replace(/\n/g, '<br>').replace(/-\s/g, '<li>').replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  message.innerHTML = content;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

async function generateAIResponse(input) {
  if (!chatbotMessages) return;
  const loadingMessage = document.createElement('div');
  loadingMessage.classList.add('chatbot-message', 'bot');
  loadingMessage.textContent = 'Fetching travel info...';
  chatbotMessages.appendChild(loadingMessage);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

  try {
    chatHistory.push({ role: 'user', parts: [{ text: input }] });
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [{ text: `You are a TravelGo guide. Provide a concise answer (max 150 words) to the tourism query: "${input}". Focus on key details like attractions, dining, travel tips, or best time to visit. Use bullet points for clarity. Bold destination names (e.g., **Bangkok**) using markdown. Do not ask follow-up questions or include conversational fluff. Use reliable, up-to-date information.` }]
        }],
        generationConfig: { temperature: 0.5, maxOutputTokens: 200 }
      })
    });
    const data = await response.json();
    if (data.candidates?.[0]?.content) {
      const answer = data.candidates[0].content.parts[0].text;
      chatHistory.push({ role: 'model', parts: [{ text: answer }] });
      loadingMessage.remove();
      addMessage(answer, false);
    } else {
      throw new Error('No response from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    loadingMessage.remove();
    addMessage(generateFallbackResponse(input.toLowerCase()), false);
  }
}

function generateFallbackResponse(input) {
  for (const [key, destination] of Object.entries(destinations)) {
    if (input.includes(key)) {
      if (input.includes('places') || input.includes('attractions')) return destination.attractions.join('<br>');
      if (input.includes('restaurants') || input.includes('food')) return destination.dining.join('<br>');
      if (input.includes('tips') || input.includes('advice')) return destination.tips;
      if (input.includes('best time') || input.includes('when to visit')) return destination.bestTime;
      return `
        Attractions: ${destination.attractions.join('<br>')}<br>
        Dining: ${destination.dining.join('<br>')}<br>
        Tips: ${destination.tips}<br>
        Best Time: ${destination.bestTime}
      `;
    }
  }

  if (input.includes('travel tips')) return tourismTopics['travel tips'];
  if (input.includes('budget') || input.includes('cheap')) return tourismTopics['budget travel'];
  if (input.includes('safety')) return tourismTopics['safety'];
  if (input.includes('culture') || input.includes('customs')) return tourismTopics['culture'];
  if (input.includes('activities') || input.includes('things to do')) return tourismTopics['activities'];
  if (input.includes('sustainable') || input.includes('eco-friendly')) return tourismTopics['sustainable travel'];
  if (input.includes('solo') || input.includes('alone')) return tourismTopics['solo travel'];
  if (input.includes('family') || input.includes('kids')) return tourismTopics['family travel'];
  if (input.includes('visa')) return 'Check embassy websites for visa rules. Ensure passport validity. Some countries offer e-visas.';
  if (input.includes('packing')) return 'Pack versatile clothing, a universal adapter, reusable bottle. Check weather and dress codes.';
  if (input.includes('weather')) return 'Weather varies by destination. Share your destination for specific advice.';
  if (input.includes('currency')) return 'Check local currency. Use apps like XE for rates. Carry cash for small vendors.';
  if (input.includes('hello') || input.includes('hi')) return 'Hi! I’m TravelGo Guide. Ask about any destination or travel topic.';

  return 'Sorry, I didn’t catch that. Ask about a destination, tips, or activities. Or visit our <a href="index.html#contact">Contact section</a>.';
}

function handleUserInput() {
  const input = chatbotInput.value.trim();
  if (!input) return;
  addMessage(input, true);
  chatbotInput.value = '';
  generateAIResponse(input);
}

// Chatbot page logic
if (isChatbotPage) {
  // Initial welcome message
  addMessage('Welcome to <strong>TravelGo Guide</strong>!I provide instant travel advice for any destination. Ask away or click a destination tile.', false);

  // Handle query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const destination = urlParams.get('destination');
  if (destination) {
    addMessage(`Tell me about ${destination}`, true);
    generateAIResponse(`Tell me about ${destination}`);
  }

  // Tile clicks
  destinationCards.forEach(card => {
    card.addEventListener('click', () => {
      const destination = card.getAttribute('data-destination');
      console.log(`Tile clicked: ${destination}`); // Debug
      addMessage(`Tell me about ${destination}`, true);
      generateAIResponse(`Tell me about ${destination}`);
    });
  });

  // Input handling
  chatbotSend.addEventListener('click', handleUserInput);
  chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleUserInput();
  });

  // Focus trap
  const chatbotContainer = document.querySelector('.chatbot-container');
  chatbotContainer.addEventListener('keydown', (e) => {
    const focusableElements = chatbotContainer.querySelectorAll('button, input');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    if (e.key === 'Tab') {
      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  });
}

// Index page logic
if (!isChatbotPage && destinationContent) {
  destinationCards.forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const destination = card.getAttribute('data-destination');
      console.log(`Tile clicked: ${destination}`); // Debug
      displayDestinationContent(destination);
      window.location.href = `chatbot.html?destination=${destination}`;
    });
  });
}
