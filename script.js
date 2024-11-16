const getLang = () =>
  new URLSearchParams(window.location.search).get("lang") || "sv";

const fetchData = async () => {
  await Promise.all([fetchGigs(), fetchInstruments()]);
};

const BASE_API_URL = "https://appendix.bleckhornen.org/api/trpc";
const LANGUAGES = ["sv", "en"];
const SECTIONS = {
  sv: [
    "Piccola",
    "Flöjt",
    "Oboe",
    "Klarinett",
    "Fagott",
    "Basklarinett",
    "Sopransax",
    "Altsax",
    "Tenorsax",
    "Barytonsax",
    "Horn",
    "Trumpet",
    "Trombon",
    "Eufonium",
    "Tuba",
    "Slagverk",
    "Balett",
  ],
  en: [
    "Piccolo",
    "Flute",
    "Oboe",
    "Clarinet",
    "Bassoon",
    "Bass clarinet",
    "Soprano sax",
    "Alto sax",
    "Tenor sax",
    "Baritone sax",
    "French horn",
    "Trumpet",
    "Trombone",
    "Euphonium",
    "Tuba",
    "Percussion",
    "Ballet",
  ],
};

const fetchGigs = async () => {
  const gigUrlTemplate = `${BASE_API_URL}/gig.getMany?input=%7B%22json%22%3A%7B%22startDate%22%3A%22<DATEGOESHERE>T00%3A00%3A00.000Z%22%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22startDate%22%3A%5B%22Date%22%5D%7D%7D%7D`;
  const now = new Date();
  const gigUrl = gigUrlTemplate.replace(
    "<DATEGOESHERE>",
    now.toISOString().split("T")[0]
  );
  const gigs = await fetch(gigUrl)
    .then((res) => res.json())
    .then((data) => data.result.data.json);

  const gigListElement = document.getElementById("gig-list");

  for (const gig of gigs) {
    const gigDate = new Date(gig.date);
    const gigDay = gigDate.getDate();
    let gigMonth = gigDate.getMonth() + 1;
    if (gigMonth < 10) {
      gigMonth = `0${gigMonth}`;
    }
    const gigYear = gigDate.getFullYear();
    const gigTime = gig.start.trim().replace(".", ":");
    const gigLocation = gig.location;
    const gigTitle = gig.title;
    const gigDescription = gig.publicDescription;

    const gigInfoElement = document.createElement("p");
    gigInfoElement.classList.add("gig-info");
    gigInfoElement.innerText = `${gigYear}.${gigMonth}.${gigDay}${gigTime ? ' ' + gigTime : ''}, ${gigLocation}`;

    const gigTitleElement = document.createElement("h3");
    gigTitleElement.classList.add("gig-title");
    gigTitleElement.innerText = gigTitle;

    const gigElement = document.createElement("li");
    gigElement.classList.add("gig", "list-group-item");
    gigElement.appendChild(gigInfoElement);
    gigElement.appendChild(gigTitleElement);

    if (gigDescription) {
      const gigDescriptionElement = document.createElement("p");
      gigDescriptionElement.classList.add("gig-description");
      gigDescriptionElement.innerText = gigDescription;
      gigElement.appendChild(gigDescriptionElement);
    }

    gigListElement.appendChild(gigElement);
  }

  if (gigs.length === 0) {
    const noGigsElement = document.createElement("i");
    gigListElement.classList.add("text-center");
    const lang = getLang();
    noGigsElement.innerHTML += `<span class="lang-sv${
      lang !== "sv" ? " d-none" : ""
    }">Tyvärr har vi inga allmänna spelningar inplanerade för tillfället.</span><span class="lang-en${
      lang !== "en" ? " d-none" : ""
    }">Unfortunately we have no public gigs planned at the moment.</span>`;
    gigListElement.appendChild(noGigsElement);
  }
};

const fetchInstruments = async () => {
  const instrumentsElement = document.getElementById("sections");
  for (const [index, instrument] of SECTIONS.sv.entries()) {
    const label = document.createElement("label");
    label.classList.add("list-group-item", "mb-0", "p-1");
    const checkbox = document.createElement("input");
    checkbox.classList.add("form-check-input", "me-1");
    checkbox.type = "checkbox";
    checkbox.name = "section" + instrument;
    checkbox.value = "true";
    checkbox.ariaLabel = instrument;
    label.appendChild(checkbox);
    const enInstrument = SECTIONS.en[index];
    const lang = getLang();
    label.innerHTML += `<span class="lang-sv${
      lang !== "sv" ? " d-none" : ""
    }">${instrument}</span><span class="lang-en${
      lang !== "en" ? " d-none" : ""
    }">${enInstrument}</span>`;
    instrumentsElement.appendChild(label);
  }
};

const handleJoinSubmit = async (event) => {
  const apiUrl = `${BASE_API_URL}/mail.application?batch=1`;
  event.preventDefault();
  const joinForm = event.currentTarget;
  const formData = new FormData(joinForm);

  let data = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("section") && value === "true") {
      if (data["sections"] === undefined) {
        data["sections"] = [];
      }
      data["sections"].push(key.replace("section", ""));
    } else {
      data[key] = value;
    }
  }

  const payload = {
    0: {
      json: data,
    },
  };

  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      if (getLang() === "en") {
        joinForm.innerHTML = `<p class="text-success">Thank you for your application! We will get back to you as soon as possible!</p>`;
      } else {
        joinForm.innerHTML = `<p class="text-success">Tack för din ansökan! Vi återkommer så snart vi kan!</p>`;
      }
    });
};
const joinForm = document.getElementById("joinForm");
joinForm.addEventListener("submit", handleJoinSubmit);

const handleBookSubmit = async (event) => {
  const apiUrl = `${BASE_API_URL}/mail.bookingRequest?batch=1`;
  event.preventDefault();
  const bookForm = event.currentTarget;
  const formData = new FormData(bookForm);
  const data = {
    ...Object.fromEntries(formData.entries()),
    emailTo: "styrelsen@bleckhornen.org",
  };
  const payload = {
    0: {
      json: data,
    },
  };
  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      if (getLang() === "en") {
        bookForm.innerHTML = `<p class="text-success">Thank you for your booking request! We will get back to you as soon as possible!</p>`;
      } else {
        bookForm.innerHTML = `<p class="text-success">Tack för din bokningsförfrågan! Vi återkommer så snart vi kan!</p>`;
      }
    });
};
const bookForm = document.getElementById("bookForm");
bookForm.addEventListener("submit", handleBookSubmit);

const disableLanguage = (language) => {
  const langElements = document.querySelectorAll(`.lang-${language}`);
  for (const element of langElements) {
    element.classList.add("d-none");
  }
};

const enableLanguage = (language) => {
  const langElements = document.querySelectorAll(`.lang-${language}`);
  for (const element of langElements) {
    element.classList.remove("d-none");
  }
};

const setLang = (language) => {
  if (LANGUAGES.includes(language)) {
    if (language === "sv") {
      window.history.pushState({}, "", window.location.pathname);
    } else {
      window.history.pushState({}, "", `?lang=${language}`);
    }
  }
  for (const lang of LANGUAGES) {
    if (lang === language) {
      enableLanguage(lang);
    } else {
      disableLanguage(lang);
    }
  }
};

const lang = getLang();
if (lang && LANGUAGES.includes(lang)) {
  setLang(lang);
} else {
  setLang("sv");
}
