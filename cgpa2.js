const searchList = document.querySelector('[data-search-list]');
const searchListItemTemplate = document.querySelector(
  '[data-search-list-item-template]'
);

const searchInput = document.querySelector('[data-search]');
const institutionNotFound = document.querySelector('.institution-not-found');

let institutions = [];

fetch('educationalInstitutions.json')
  .then((res) => res.json())
  .then((data) => {
    institutions = data.map((institution) => {
      const listItem =
        searchListItemTemplate.content.cloneNode(true).children[0];

      const name = listItem.querySelector('[data-name]');
      const country = listItem.querySelector('[data-country]');
      name.textContent = institution.searchName;
      country.textContent = institution.country;
      listItem.href = `${institution.countryId}/${institution.id}.html`;
      searchList.append(listItem);
      return {
        searchName: institution.searchName,
        country: institution.country,
        element: listItem,
      };
    });
  });

searchInput.addEventListener('input', (e) => {
  const value = e.target.value.toLowerCase();
  searchList.classList.toggle('hide', !value);
  let hideCount = 0;
  institutions.forEach((institution) => {
    const isVisible = institution.searchName.toLowerCase().includes(value);
    institution.element.classList.toggle('hide', !isVisible);
    if (!isVisible) hideCount++;
  });

  hideInstituionNotFoundSection = hideCount !== institutions.length;
  institutionNotFound.classList.toggle('hide', hideInstituionNotFoundSection);
});
