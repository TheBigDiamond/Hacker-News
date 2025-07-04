function showLoading(show) {
  const loadingElement = document.getElementById("loading");
  if (loadingElement) {
    loadingElement.classList.toggle("hidden", !show);
  }
}

async function fetchTopStories() {
  showLoading(true);
  try {
    const response = await fetch(
      "https://hacker-news.firebaseio.com/v0/newstories.json"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const storyIds = await response.json();

    const topStoryIds = storyIds.slice(0, 10);

    const storyPromises = topStoryIds.map((id) =>
      fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(
        (res) => res.json()
      )
    );

    const stories = await Promise.all(storyPromises);
    return stories;
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  } finally {
    showLoading(false);
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const stories = await fetchTopStories();
  console.log("Top stories:", stories);

  const newsContainer = document.getElementById("newsList");
  if (newsContainer) {
    stories.forEach((story) => {
      if (story) {
        const storyElement = document.createElement("div");
        storyElement.className = "story";
        storyElement.innerHTML = `
                    <h3><a href="${story.url}" target="_blank">${
          story.title
        }</a></h3>
                    <p>${story.score} points by ${story.by} | ${
          story.descendants || 0
        } comments</p>
                `;
        newsContainer.appendChild(storyElement);
      }
    });
  }
});
