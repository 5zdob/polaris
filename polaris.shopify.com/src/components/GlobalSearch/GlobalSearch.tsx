import {useState, useEffect, createContext, useContext} from 'react';
import {
  GroupedSearchResults,
  SearchResultCategory,
  SearchResults,
} from '../../types';
import {useThrottle} from '../../utils/hooks';
import styles from './GlobalSearch.module.scss';
import {useRouter} from 'next/router';
import {MagicMajor} from '@shopify/polaris-icons';
import IconGrid from '../IconGrid';
import Grid from '../Grid';
import TokenList from '../TokenList';
import {Dialog} from '@headlessui/react';
import {KeyboardEventHandler} from 'react';
import FoundationsThumbnail from '../FoundationsThumbnail';
import ComponentThumbnail from '../ComponentThumbnail';
const CATEGORY_NAMES: {[key in SearchResultCategory]: string} = {
  components: 'Components',
  foundations: 'Foundations',
  tokens: 'Tokens',
  icons: 'Icons',
};

const SearchContext = createContext({id: '', currentItemId: ''});

export function useGlobalSearchResult() {
  const searchContext = useContext(SearchContext);
  if (!searchContext.id) return null;
  const {id, currentItemId} = searchContext;

  return {
    id,
    'data-is-global-search-result': true,
    'data-is-current-result': currentItemId === id,
    tabIndex: -1,
  };
}

function scrollToTop() {
  const overflowEl = document.querySelector(`.${styles.ResultsInner}`);
  overflowEl?.scrollTo({top: 0, behavior: 'smooth'});
}

function scrollIntoView() {
  const overflowEl = document.querySelector(`.${styles.ResultsInner}`);
  const highlightedEl = document.querySelector(
    '#search-results [data-is-current-result="true"]',
  );

  if (overflowEl && highlightedEl) {
    const overflowElBounds = overflowEl.getBoundingClientRect();
    const highlightedElBounds = highlightedEl.getBoundingClientRect();

    const isCloseToTop = highlightedElBounds.top - overflowElBounds.top < 100;
    const isCloseToBottom =
      highlightedElBounds.top + highlightedElBounds.height >
      overflowElBounds.top + overflowElBounds.height - 100;

    if (isCloseToTop || isCloseToBottom) {
      highlightedEl.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }
}

function GlobalSearch() {
  const [searchMode, setSearchMode] = useState<'search' | 'ai'>('search');
  const [searchResults, setSearchResults] = useState<GroupedSearchResults>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentResultIndex, setCurrentResultIndex] = useState(0);

  const [prompt, setPrompt] = useState('');
  const [promptResults, setPromptResults] = useState<
    {question: string; answer: string; searchResults: GroupedSearchResults}[]
  >([]);

  const router = useRouter();

  let resultsInRenderedOrder: SearchResults = [];

  searchResults.forEach((group) => {
    resultsInRenderedOrder = [...resultsInRenderedOrder, ...group.results];
  });

  const searchResultsCount = resultsInRenderedOrder.length;

  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      let isSlashKey = event.key === '/';
      if (isSlashKey) {
        event.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', listener);

    return () => document.removeEventListener('keydown', listener);
  }, []);

  const throttledSearch = useThrottle(() => {
    fetch(`/api/search/v0?q=${encodeURIComponent(searchTerm)}`)
      .then((data) => data.json())
      .then((json) => {
        const {results} = json;
        setSearchResults(results);
      });

    setCurrentResultIndex(0);
    scrollToTop();
  }, 400);

  useEffect(throttledSearch, [searchTerm, throttledSearch]);

  useEffect(() => scrollIntoView(), [currentResultIndex]);

  useEffect(() => {
    const handler = () => setIsOpen(false);

    router.events.on('beforeHistoryChange', handler);
    router.events.on('hashChangeComplete', handler);

    return () => {
      router.events.off('beforeHistoryChange', handler);
      router.events.off('hashChangeComplete', handler);
    };
  }, [setIsOpen, router.events]);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleAskQuestion = async () => {
    if (prompt) {
      fetch(`/api/prompts?p=${encodeURIComponent(prompt)}`)
        .then((data) => data.json())
        .then((json) => {
          const {data} = json;
          console.log(data);
          setPromptResults((prev) => [
            {
              question: prompt,
              answer: data.answer,
              searchResults: data.searchResults,
            },
            ...prev,
          ]);
        });
    }
  };

  const handleKeyboardNavigation: KeyboardEventHandler<HTMLDivElement> = (
    evt,
  ) => {
    switch (evt.code) {
      case 'ArrowDown':
        if (currentResultIndex < searchResultsCount - 1) {
          setCurrentResultIndex(currentResultIndex + 1);
          evt.preventDefault();
        }
        break;

      case 'ArrowUp':
        if (currentResultIndex > 0) {
          setCurrentResultIndex(currentResultIndex - 1);
          evt.preventDefault();
        }
        break;

      case 'Enter':
        if (resultsInRenderedOrder.length > 0) {
          setIsOpen(false);
          const url = resultsInRenderedOrder[currentResultIndex].url;
          router.push(url);
        }
        break;
    }
  };

  const currentItemId = resultsInRenderedOrder[currentResultIndex]?.id || '';
  console.log(searchResults);
  return (
    <>
      <button
        className={styles.ToggleButton}
        onClick={() => setIsOpen(true)}
        aria-label="Search"
      >
        <SearchIcon />
        Search <span className={styles.KeyboardShortcutHint}>/</span>
      </button>

      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <div className={styles.PreventBackgroundInteractions}></div>
        <div className="dark-mode styles-for-site-but-not-polaris-examples">
          <Dialog.Panel className={styles.Results}>
            {searchMode === 'search' && (
              <Search
                value={searchTerm}
                onChange={(evt) => setSearchTerm(evt.target.value)}
                onKeyUp={handleKeyboardNavigation}
                searchResultsCount={searchResultsCount}
                currentItemId={currentItemId}
                onSearchModeToggle={() => setSearchMode('ai')}
                onClose={() => setIsOpen(false)}
              />
            )}
            {searchMode === 'ai' && (
              <AIPrompt
                value={prompt}
                onChange={(evt) => setPrompt(evt.target.value)}
                onKeyUp={handleKeyboardNavigation}
                searchResultsCount={promptResults.length}
                currentItemId={currentItemId}
                onSearchModeToggle={() => setSearchMode('search')}
                onClose={() => setIsOpen(false)}
                onAskQuestion={handleAskQuestion}
              />
            )}
            <div
              className={styles.ResultsInner}
              id="search-results"
              role="listbox"
              aria-label="Search results"
            >
              {searchMode === 'search' && searchResults && (
                <SearchResults
                  searchResults={searchResults}
                  currentItemId={currentItemId}
                />
              )}
              {searchMode === 'ai' && promptResults.length < 1 && (
                <h3 className={styles.PromptAnswer}>
                  <span className={styles.BlinkingCursor}>|</span>
                </h3>
              )}
              {searchMode === 'ai' && promptResults.length > 0 && (
                <>
                  {promptResults.map(
                    ({question, answer, searchResults}, idx) => (
                      <>
                        {/* <p>{question}</p> */}
                        <h3 key={idx} className={styles.PromptAnswer}>
                          <TypingAnimation message={answer} />
                        </h3>
                        {searchResults && (
                          <SearchResults
                            searchResults={searchResults}
                            currentItemId={currentItemId}
                          />
                        )}
                      </>
                    ),
                  )}
                </>
              )}
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </>
  );
}

const TypingAnimation = ({message}) => {
  const [text, setText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const messageSplit = message.split(' ');
  console.log(message);

  useEffect(() => {
    let intervalId = null;

    if (isTyping) {
      intervalId = setInterval(() => {
        setText(
          (text) =>
            text +
            (messageSplit[text.split(' ').length] === undefined
              ? ''
              : messageSplit[text.length == 0 ? 0 : text.split(' ').length] +
                ' '),
        );
        if (text.length === message.length) {
          setIsTyping(false);
        }
        console.log('text', text);
      }, 150);
    } else {
      clearInterval(intervalId);
    }
    return () => clearInterval(intervalId);
  }, [isTyping, text, currentIndex, message]);

  return (
    <span>
      {text}
      <span className={styles.BlinkingCursor}>|</span>
    </span>
  );
};

function SearchResults({
  searchResults,
  currentItemId,
}: {
  searchResults: GroupedSearchResults;
  currentItemId: string;
}) {
  return (
    <>
      {searchResults.map(({category, results}) => {
        if (results.length === 0) return null;
        switch (category) {
          case 'foundations':
            return (
              <ResultsGroup category={category} key={category}>
                <Grid>
                  {results.map(({id, url, meta}) => {
                    if (!meta.foundations) return null;
                    const {title, description, icon, category} =
                      meta.foundations;
                    return (
                      <SearchContext.Provider
                        key={title}
                        value={{currentItemId, id}}
                      >
                        <Grid.Item
                          title={title}
                          description={description}
                          url={url}
                          renderPreview={() => (
                            <FoundationsThumbnail
                              icon={icon}
                              category={category}
                            />
                          )}
                        />
                      </SearchContext.Provider>
                    );
                  })}
                </Grid>
              </ResultsGroup>
            );

          case 'components': {
            return (
              <ResultsGroup category={category} key={category}>
                <Grid>
                  {results.map(({id, url, meta}) => {
                    if (!meta.components) return null;
                    const {title, description, status} = meta.components;
                    return (
                      <SearchContext.Provider
                        key={id}
                        value={{currentItemId, id}}
                      >
                        <Grid.Item
                          url={url}
                          description={description}
                          title={title}
                          status={status}
                          renderPreview={() => (
                            <ComponentThumbnail title={title} />
                          )}
                        />
                      </SearchContext.Provider>
                    );
                  })}
                </Grid>
              </ResultsGroup>
            );
          }

          case 'tokens': {
            return (
              <ResultsGroup category={category} key={category}>
                <TokenList
                  showTableHeading={false}
                  columns={{
                    preview: true,
                    name: true,
                    figmaUsage: false,
                    value: false,
                    description: true,
                  }}
                >
                  {results.map(({id, meta}) => {
                    if (!meta.tokens) return null;
                    const {token, category} = meta.tokens;
                    return (
                      <SearchContext.Provider
                        key={id}
                        value={{currentItemId, id}}
                      >
                        <TokenList.Item category={category} token={token} />
                      </SearchContext.Provider>
                    );
                  })}
                </TokenList>
              </ResultsGroup>
            );
          }

          case 'icons': {
            return (
              <ResultsGroup category={category} key={category}>
                <IconGrid>
                  {results.map(({id, meta}) => {
                    if (!meta.icons) return null;
                    const {icon} = meta.icons;
                    return (
                      <SearchContext.Provider
                        key={id}
                        value={{currentItemId, id}}
                      >
                        <IconGrid.Item icon={icon} />
                      </SearchContext.Provider>
                    );
                  })}
                </IconGrid>
              </ResultsGroup>
            );
          }

          default:
            return [];
        }
      })}
    </>
  );
}

function Search({
  value,
  onChange,
  onKeyUp,
  onClose,
  onSearchModeToggle,
  searchResultsCount,
  currentItemId,
}: {
  value: string;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp: KeyboardEventHandler<HTMLDivElement>;
  onClose: () => void;
  onSearchModeToggle: () => void;
  searchResultsCount: number;
  currentItemId: string;
}) {
  return (
    <div className={styles.Header}>
      <div className={styles.SearchIcon}>
        <SearchIcon />
      </div>
      <input
        type="search"
        value={value}
        onChange={onChange}
        role="combobox"
        aria-controls="search-results"
        aria-expanded={searchResultsCount > 0}
        aria-activedescendant={currentItemId}
        onKeyUp={onKeyUp}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Search"
      />
      <button className={styles.SearchModeToggle} onClick={onSearchModeToggle}>
        Try AI prompt <MagicMajor />
      </button>
      <button className={styles.MobileCloseButton} onClick={onClose}>
        Close
      </button>
    </div>
  );
}

function AIPrompt({
  value,
  onChange,
  onKeyUp,
  onClose,
  onSearchModeToggle,
  searchResultsCount,
  currentItemId,
  onAskQuestion,
}: {
  value: string;
  onChange: (evt: React.ChangeEvent<HTMLInputElement>) => void;
  onKeyUp: KeyboardEventHandler<HTMLDivElement>;
  onClose: () => void;
  onSearchModeToggle: () => void;
  searchResultsCount: number;
  currentItemId: string;
  onAskQuestion: () => Promise<void>;
}) {
  return (
    <div className={styles.Header}>
      <div className={styles.AIPromptIcon}>
        <MagicMajor />
      </div>
      <input
        type="search"
        value={value}
        onChange={onChange}
        role="combobox"
        aria-controls="search-results"
        aria-expanded={searchResultsCount > 0}
        aria-activedescendant={currentItemId}
        onKeyUp={onKeyUp}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        placeholder="Ask a question"
      />
      <button className={styles.AskButton} onClick={onAskQuestion}>
        Send question
      </button>
      <button className={styles.SearchModeToggle} onClick={onSearchModeToggle}>
        Back to search
      </button>
      <button className={styles.MobileCloseButton} onClick={onClose}>
        Close
      </button>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2 8c0-3.309 2.691-6 6-6s6 2.691 6 6-2.691 6-6 6-6-2.691-6-6zm17.707 10.293l-5.395-5.396A7.946 7.946 0 0016 8c0-4.411-3.589-8-8-8S0 3.589 0 8s3.589 8 8 8a7.954 7.954 0 004.897-1.688l5.396 5.395A.998.998 0 0020 19a1 1 0 00-.293-.707z"
        fill="currentColor"
      />
    </svg>
  );
}

function ResultsGroup({
  category,
  children,
}: {
  category: SearchResultCategory;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.ResultsGroup}>
      <h3 className={styles.ResultsGroupName}>{CATEGORY_NAMES[category]}</h3>
      {children}
    </div>
  );
}

export default GlobalSearch;
