import Notiflix from 'notiflix';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

let currentPage = 1;
const loadMoreButton = document.querySelector('.load-more');
const imageContainer = document.querySelector('.gallery');
const lightbox = new SimpleLightbox('.gallery a');

loadMoreButton.style.display = 'none'; 

const smoothScroll = () => {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
};

const fetchImages = async function (searchQuery, page) {
  const apiKey = '42307498-ea071ee1b3b782b2dd806b3ee';
  const apiUrl = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    searchQuery
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=40`;

  try {
    const response = await axios.get(apiUrl);
    const data = response.data;

    if (page === 1) {
      imageContainer.innerHTML = '';
      loadMoreButton.style.display = 'none';
    }

    if (data.hits && data.hits.length > 0) {
      data.hits.forEach(hit => {
        const imageElement = document.createElement('div');
        imageElement.className = 'card-container';
        imageElement.innerHTML = `
          <a href="${hit.largeImageURL}" data-lightbox="gallery" data-title="${hit.tags}">
            <img src="${hit.webformatURL}" alt="${hit.tags}" loading="lazy"/>
          </a>
          <div class="info">
            <p class="info-item"><b>Likes</b><br>${hit.likes}</p>
            <p class="info-item"><b>Views</b><br>${hit.views}</p>
            <p class="info-item"><b>Comments</b><br>${hit.comments}</p>
            <p class="info-item"><b>Downloads</b><br>${hit.downloads}</p>
          `;
        imageContainer.appendChild(imageElement);
      });

      lightbox.refresh();
      smoothScroll();
      currentPage++;
       
      Notiflix.Notify.success(`Hooray! We found ${data.totalHits} images.`);

      loadMoreButton.style.display = 'block';

    } else {
      Notiflix.Notify.failure('Sorry, there are no images matching your search query. Please try again.');

      loadMoreButton.style.display = 'none';
    }

    if (data.totalHits > 0 && data.totalHits <= currentPage * 40) {
      loadMoreButton.style.display = 'none';
      if (page === 1) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
      }
    }

    isLoading = false;
  } catch (error) {
    console.error('Error fetching images:', error);
    isLoading = false;
  }
};

document.getElementById('search-form').addEventListener('submit', function (event) {
  event.preventDefault();

  const searchQuery = document.querySelector('[name="searchQuery"]').value;

  if (searchQuery.trim() !== '') {
    fetchImages(searchQuery, 1);
  }
});

window.addEventListener('scroll', function () {
  const searchQuery = document.querySelector('[name="searchQuery"]').value;
  const scrollPosition = window.scrollY || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const bodyHeight = document.body.clientHeight;

  if (scrollPosition + windowHeight >= bodyHeight - 200) {
    fetchImages(searchQuery, currentPage);
  }
});