// Track the current page of stories
let currentPage = 0;
const STORIES_PER_PAGE = 10;

function showLoading(show) {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.classList.toggle("hidden", !show);
  }
}

async function fetchStories(page = 0) {
  showLoading(true);
  try {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/newstories.json"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const storyIds = await response.json();

    // Calculate the range of stories to fetch based on the current page
    const startIdx = page * STORIES_PER_PAGE;
    const endIdx = startIdx + STORIES_PER_PAGE;
    const storyIdsToFetch = storyIds.slice(startIdx, endIdx);

    // Fetch details for each story
    const storyPromises = storyIdsToFetch.map(id =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`)
        .then((res) => res.json())
    );

    const stories = await Promise.all(storyPromises);
    return stories.filter((story) => story && !story.deleted);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  } finally {
    showLoading(false);
  }
}

function createStoryElement(story) {
  const storyElement = document.createElement("div");
  storyElement.className = "story";
  storyElement.innerHTML = `
    <h3><a href="${story.url}" target="_blank">${story.title}</a></h3>
    <p>${story.score || 0} points by ${story.by} | ${story.descendants || 0} comments</p>
  `;
  return storyElement;
}

async function loadStories() {
  const stories = await fetchStories(currentPage);
  const newsContainer = document.getElementById("newsList");
  
  if (newsContainer) {
    stories.forEach(story => {
      if (story) {
        newsContainer.appendChild(createStoryElement(story));
      }
    });
  }
  
  // Show/hide load more button based on if there are more stories
  const loadMoreBtn = document.getElementById('loadMore');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = stories.length === STORIES_PER_PAGE ? 'block' : 'none';
  }
}

// Initial load
document.addEventListener("DOMContentLoaded", async () => {
  // Load first page of stories
  await loadStories();
  
  // Add click event listener to load more button
  const loadMoreBtn = document.getElementById('loadMore');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', async () => {
      currentPage++;
      await loadStories();
      
      // Scroll to show the newly loaded stories
      window.scrollTo({
        top: document.body.scrollHeight - 1000,
        behavior: 'smooth'
      });
    });
  }
});
