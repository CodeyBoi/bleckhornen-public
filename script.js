console.log('script.js loaded');

const fetchGigs = async () => {
    console.log('Fetching gigs');
    const gigUrlTemplate = `https://appendix.bleckhornen.org/api/trpc/gig.getMany?input=%7B%22json%22%3A%7B%22startDate%22%3A%22<DATEGOESHERE>T00%3A00%3A00.000Z%22%7D%2C%22meta%22%3A%7B%22values%22%3A%7B%22startDate%22%3A%5B%22Date%22%5D%7D%7D%7D`;
    const now = new Date();
    const gigUrl = gigUrlTemplate.replace('<DATEGOESHERE>', now.toISOString().split('T')[0]);
    const gigs = await fetch(gigUrl)
        .then(res => res.json())
        .then(data => data.result.data.json);

    for (const gig of gigs) {
        const gigDate = new Date(gig.startDate);
        const gigDay = gigDate.getDate();
        const gigMonth = gigDate.getMonth() + 1;
        const gigYear = gigDate.getFullYear();
        const gigTime = gigDate.toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' });
        const gigLocation = gig.location;
        const gigTitle = gig.title;
        const gigDescription = gig.description;
        const gigLink = gig.link;

        const gigDateElement = document.createElement('p');
        gigDateElement.classList.add('gig-date');
        gigDateElement.innerText = `${gigDay}/${gigMonth}/${gigYear} ${gigTime}`;

        const gigLocationElement = document.createElement('p');
        gigLocationElement.classList.add('gig-location');
        gigLocationElement.innerText = gigLocation;

        const gigTitleElement = document.createElement('h3');
        gigTitleElement.classList.add('gig-title');
        gigTitleElement.innerText = gigTitle;

        const gigDescriptionElement = document.createElement('p');
        gigDescriptionElement.classList.add('gig-description');
        gigDescriptionElement.innerText = gigDescription;

        const gigElement = document.createElement('li');
        gigElement.classList.add('gig');
        gigElement.classList.add('list-group-item');
        gigElement.appendChild(gigTitleElement);
        gigElement.appendChild(gigDateElement);
        gigElement.appendChild(gigLocationElement);
        gigElement.appendChild(gigDescriptionElement);

        document.getElementById('gig-list').appendChild(gigElement);
    }
}


