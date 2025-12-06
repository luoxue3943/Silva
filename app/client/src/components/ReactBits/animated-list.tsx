import {
  $,
  component$,
  Slot,
  useOnDocument,
  useSignal,
  useTask$,
  type QRL,
} from "@builder.io/qwik";

interface AnimatedItemProps {
  index: number;
  delay?: number;
  selected?: boolean;
  onMouseEnter$?: QRL<(index: number) => void>;
  onClick$?: QRL<(index: number) => void>;
  itemClassName?: string;
  class?: string;
  itemHeight?: string;
  itemWidth?: string;
}

export const AnimatedItem = component$<AnimatedItemProps>(
  ({
    index,
    delay = 0,
    onMouseEnter$,
    onClick$,
    itemClassName = "",
    class: className = "",
    itemHeight,
  }) => {
    const ref = useSignal<HTMLDivElement>();
    const inView = useSignal(false);

    useTask$(
      ({ track, cleanup }) => {
        const element = track(() => ref.value);
        if (!element) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            inView.value = entry.isIntersecting;
          },
          { threshold: 0.5 },
        );

        observer.observe(element);

        cleanup(() => observer.disconnect());
      },
      { eagerness: "visible" },
    );

    return (
      <div
        ref={ref}
        data-index={index}
        onMouseEnter$={() => onMouseEnter$ && onMouseEnter$(index)}
        onClick$={() => onClick$ && onClick$(index)}
        class={`group my-2 cursor-pointer py-2 transition-all duration-200 ${className}`}
        style={{
          transform: inView.value ? "scale(1)" : "scale(0.7)",
          opacity: inView.value ? 1 : 0,
          transitionDelay: `${delay}s`,
        }}
      >
        <div
          class={`flex items-center rounded-lg bg-[#111] px-6 transition-all duration-200 group-hover:scale-110 group-hover:bg-[#3d3d3d] ${itemClassName}`}
          style={{
            height: itemHeight,
          }}
        >
          <Slot />
        </div>
      </div>
    );
  },
);

interface AnimatedListProps<T = string> {
  items: T[];
  onItemSelect$?: QRL<(item: T, index: number) => void>;
  renderItem?: QRL<(item: T, index: number) => any>;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  class?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  itemHeight?: string;
}

export const AnimatedList = component$<AnimatedListProps<any>>(
  ({
    items,
    onItemSelect$,
    renderItem,
    showGradients = true,
    enableArrowNavigation = true,
    class: className = "",
    itemClassName = "",
    displayScrollbar = true,
    initialSelectedIndex = -1,
    itemHeight,
  }) => {
    const listRef = useSignal<HTMLDivElement>();
    const selectedIndex = useSignal(initialSelectedIndex);
    const keyboardNav = useSignal(false);
    const topGradientOpacity = useSignal(0);
    const bottomGradientOpacity = useSignal(1);

    const handleItemMouseEnter$ = $((index: number) => {
      selectedIndex.value = index;
    });

    const handleItemClick$ = $(async (index: number) => {
      selectedIndex.value = index;
      if (onItemSelect$) {
        await onItemSelect$(items[index], index);
      }
    });

    const handleScroll$ = $((event: Event) => {
      const target = event.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = target;

      topGradientOpacity.value = Math.min(scrollTop / 50, 1);

      const bottomDistance = scrollHeight - (scrollTop + clientHeight);
      bottomGradientOpacity.value =
        scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1);
    });

    // Keyboard navigation
    useOnDocument(
      "keydown",
      $((event) => {
        if (!enableArrowNavigation) return;

        const e = event as KeyboardEvent;

        if (e.key === "ArrowDown" || (e.key === "Tab" && !e.shiftKey)) {
          e.preventDefault();
          keyboardNav.value = true;
          selectedIndex.value = Math.min(
            selectedIndex.value + 1,
            items.length - 1,
          );
        } else if (e.key === "ArrowUp" || (e.key === "Tab" && e.shiftKey)) {
          e.preventDefault();
          keyboardNav.value = true;
          selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
        } else if (e.key === "Enter") {
          if (selectedIndex.value >= 0 && selectedIndex.value < items.length) {
            e.preventDefault();
            if (onItemSelect$) {
              onItemSelect$(items[selectedIndex.value], selectedIndex.value);
            }
          }
        }
      }),
    );

    // Auto-scroll to selected item
    useTask$(({ track }) => {
      const currentIndex = track(() => selectedIndex.value);
      const navActive = track(() => keyboardNav.value);
      const container = track(() => listRef.value);

      if (!navActive || currentIndex < 0 || !container) return;

      const selectedItem = container.querySelector(
        `[data-index="${currentIndex}"]`,
      ) as HTMLElement | null;

      if (selectedItem) {
        const extraMargin = 50;
        const containerScrollTop = container.scrollTop;
        const containerHeight = container.clientHeight;
        const itemTop = selectedItem.offsetTop;
        const itemBottom = itemTop + selectedItem.offsetHeight;

        if (itemTop < containerScrollTop + extraMargin) {
          container.scrollTo({
            top: itemTop - extraMargin,
            behavior: "smooth",
          });
        } else if (
          itemBottom >
          containerScrollTop + containerHeight - extraMargin
        ) {
          container.scrollTo({
            top: itemBottom - containerHeight + extraMargin,
            behavior: "smooth",
          });
        }
      }

      keyboardNav.value = false;
    });

    return (
      <div class={`relative w-full max-w-[500px] ${className}`}>
        <div
          ref={listRef}
          class={`max-h-[400px] overflow-y-auto p-10 ${
            displayScrollbar
              ? "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-track]:bg-[#060010]"
              : "scrollbar-hide"
          }`}
          onScroll$={handleScroll$}
          style={{
            scrollbarWidth: displayScrollbar ? "thin" : "none",
            scrollbarColor: "#222 #060010",
          }}
        >
          {items.map((item, index) => (
            <AnimatedItem
              key={index}
              index={index}
              delay={0.1}
              selected={selectedIndex.value === index}
              onMouseEnter$={handleItemMouseEnter$}
              onClick$={$(async () => await handleItemClick$(index))}
              itemClassName={itemClassName}
              itemHeight={itemHeight}
            >
              {renderItem ? (
                renderItem(item, index)
              ) : (
                <p class="m-0 text-white">{item}</p>
              )}
            </AnimatedItem>
          ))}
        </div>

        {showGradients && (
          <>
            <div
              class="ease pointer-events-none absolute top-0 right-0 left-0 h-[50px] bg-linear-to-b from-[#060010] to-transparent transition-opacity duration-300"
              style={{ opacity: topGradientOpacity.value }}
            />
            <div
              class="ease pointer-events-none absolute right-0 bottom-0 left-0 h-[100px] bg-linear-to-t from-[#060010] to-transparent transition-opacity duration-300"
              style={{ opacity: bottomGradientOpacity.value }}
            />
          </>
        )}
      </div>
    );
  },
);
