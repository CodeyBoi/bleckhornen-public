const fetchData = async () => {
  await Promise.all([fetchGigs(), fetchInstruments()]);
};

const fetchGigs = async () => {
  const gigUrlTemplate = `https://appendix.bleckhornen.org/api/trpc/gig.getMany?input=%7B%22json%22%3A%7B%22startDate%22%3A%22<DATEGOESHERE>T00%3A00%3A00.000Z%22%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22startDate%22%3A%5B%22Date%22%5D%7D%7D%7D`;
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
    noGigsElement.innerHTML = "Inga spelningar inplanerade :(";
    gigListElement.appendChild(noGigsElement);
  }
};

const fetchInstruments = async () => {
  const instrumentsUrl =
    "https://appendix.bleckhornen.org/api/trpc/instrument.getAll";
  const remove = ["Annat", "Dirigent"];
  const instruments = await fetch(instrumentsUrl)
    .then((res) => res.json())
    .then((data) =>
      data.result.data.json
        .filter((instrument) => !remove.includes(instrument.name))
        .sort((a, b) => a.name.localeCompare(b.name))
    );

  const instrumentsElement = document.getElementById("section");
  for (const instrument of instruments) {
    const instrumentElement = document.createElement("option");
    instrumentElement.value = instrument.name;
    instrumentElement.innerText = instrument.name;
    instrumentsElement.appendChild(instrumentElement);
  }
};

const handleJoinSubmit = async (event) => {
  const apiUrl = "https://staging.bleckhornen.org/api/trpc/application.create";
  event.preventDefault();
  const joinForm = event.currentTarget;
  console.log(joinForm);
  const formData = new FormData(joinForm);

  for (const [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }

  // const data = {
  //   name: formData.get("joinName"),
  //   email: formData.get("joinEmail"),
  //   instrument: formData.get("joinInstrument"),
  //   description: formData.get("joinMessage"),
  // };
  console.log(formData);
  return;

  await fetch(apiUrl, {
    method: "POST",
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.error) {
        throw new Error(data.error.message);
      }
      joinForm.innerHTML = `<p class="text-success">Tack för din ansökan!</p>`;
    });
};
const joinForm = document.getElementById("joinForm");
joinForm.addEventListener("submit", handleJoinSubmit);
