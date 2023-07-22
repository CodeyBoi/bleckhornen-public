const fetchData = async () => {
  await Promise.all([fetchGigs(), fetchInstruments()]);
};

const BASE_API_URL = "https://appendix.bleckhornen.org/api/trpc";

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
    const gigTime = gig.start.replace(".", ":");
    const gigLocation = gig.location;
    const gigTitle = gig.title;

    const gigDateElement = document.createElement("p");
    gigDateElement.classList.add("gig-date");
    gigDateElement.innerText = `${gigYear}.${gigMonth}.${gigDay} ${gigTime}`;

    const gigTitleElement = document.createElement("h3");
    gigTitleElement.classList.add("gig-title");
    gigTitleElement.innerText = gigTitle;

    const gigLocationElement = document.createElement("p");
    gigLocationElement.classList.add("gig-location");
    gigLocationElement.innerText = "Plats: " + gigLocation;

    const gigElement = document.createElement("li");
    gigElement.classList.add("gig", "list-group-item");
    gigElement.appendChild(gigDateElement);
    gigElement.appendChild(gigTitleElement);
    if (gigLocation) {
      gigElement.appendChild(gigLocationElement);
    }
    gigListElement.appendChild(gigElement);
  }

  if (gigs.length === 0) {
    const noGigsElement = document.createElement("i");
    noGigsElement.innerHTML =
      "Vi har tyvärr inga allmänna spelningar inplanerade för tillfället. Håll utkik här eller på vår Facebooksida för att se när vi spelar nästa gång!";
    gigListElement.appendChild(noGigsElement);
  }
};

const fetchInstruments = async () => {
  const instrumentsUrl = `${BASE_API_URL}/instrument.getAll`;
  const remove = ["Annat", "Dirigent"];
  const instruments = await fetch(instrumentsUrl)
    .then((res) => res.json())
    .then((data) =>
      data.result.data.json
        .filter((instrument) => !remove.includes(instrument.name))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

  const instrumentsElement = document.getElementById("joinSection");
  for (const instrument of instruments) {
    const instrumentElement = document.createElement("option");
    instrumentElement.value = instrument.name;
    instrumentElement.innerText = instrument.name;
    instrumentsElement.appendChild(instrumentElement);
  }
};

const handleJoinSubmit = async (event) => {
  const apiUrl = `${BASE_API_URL}/mail.application?batch=1`;
  event.preventDefault();
  const joinForm = event.currentTarget;
  const formData = new FormData(joinForm);
  const data = {
    ...Object.fromEntries(formData.entries()),
    emailTo: "info@bleckhornen.org",
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
      joinForm.innerHTML = `<p class="text-success">Tack för din ansökan! Vi återkommer så snart vi kan!</p>`;
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
      bookForm.innerHTML = `<p class="text-success">Tack för din bokningsförfrågan! Vi återkommer så snart vi kan!</p>`;
    });
};
const bookForm = document.getElementById("bookForm");
bookForm.addEventListener("submit", handleBookSubmit);
