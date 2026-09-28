(() => {
  "use strict";

  window.selectFeaturedRepos = (repositories = [], featuredRepos = []) => {
    if (!Array.isArray(repositories) || !Array.isArray(featuredRepos) || featuredRepos.length === 0) {
      return [];
    }

    const available = new Map(
      repositories
        .filter((repo) => repo && typeof repo.name === "string" && !repo.fork && !repo.archived)
        .map((repo) => [repo.name.toLowerCase(), repo])
    );

    return featuredRepos
      .filter((name) => typeof name === "string")
      .map((name) => available.get(name.toLowerCase()))
      .filter(Boolean);
  };
})();
