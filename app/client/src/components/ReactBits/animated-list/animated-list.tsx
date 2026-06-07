"use client";

/**
 * 动画列表组件 / Animated list component
 *
 * 提供可自定义渲染的列表项、键盘导航和滚动边缘渐变。 / Provide custom item rendering, keyboard navigation, and scroll edge gradients
 */

import {
  type CSSProperties,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import styles from "./animated-list.module.scss";

/**
 * 动画列表项参数 / Animated item props
 */
interface AnimatedItemProps {
  index: number;
  delay?: number;
  selected?: boolean;
  onMouseEnter?: (index: number) => void;
  onClick?: (index: number) => void;
  itemClassName?: string;
  className?: string;
  itemHeight?: string;
  itemWidth?: string;
  children: ReactNode;
}

export function AnimatedItem({
  index,
  delay = 0,
  selected = false,
  onMouseEnter,
  onClick,
  itemClassName = "",
  className = "",
  itemHeight,
  itemWidth,
  children,
}: AnimatedItemProps) {
  const itemStyle: CSSProperties = {
    animationDelay: `${delay}s`,
    width: itemWidth,
  };

  const innerStyle: CSSProperties = {
    height: itemHeight,
  };

  return (
    <div
      data-index={index}
      data-selected={selected}
      onMouseEnter={() => onMouseEnter?.(index)}
      onClick={() => onClick?.(index)}
      className={`${styles["animated-item"]} group my-2 cursor-pointer py-2 ${className}`}
      style={itemStyle}
    >
      <div
        className={`flex items-center rounded-lg bg-[#111] px-6 transition-all duration-300 group-hover:scale-105 group-hover:bg-[#3d3d3d] ${itemClassName}`}
        style={innerStyle}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * 动画列表参数 / Animated list props
 */
interface AnimatedListProps<T = string> {
  items: T[];
  onItemSelect?: (item: T, index: number) => void | Promise<void>;
  renderItem?: (item: T, index: number) => ReactNode;
  showGradients?: boolean;
  enableArrowNavigation?: boolean;
  className?: string;
  itemClassName?: string;
  displayScrollbar?: boolean;
  initialSelectedIndex?: number;
  itemHeight?: string;
}

export function AnimatedList<T = string>({
  items,
  onItemSelect,
  renderItem,
  showGradients = true,
  enableArrowNavigation = true,
  className = "",
  itemClassName = "",
  displayScrollbar = true,
  initialSelectedIndex = -1,
  itemHeight,
}: AnimatedListProps<T>) {
  const listRef = useRef<HTMLDivElement | null>(null);

  const [selectedIndex, setSelectedIndex] = useState(initialSelectedIndex);
  const [keyboardNav, setKeyboardNav] = useState(false);
  const [topGradientOpacity, setTopGradientOpacity] = useState(0);
  const [bottomGradientOpacity, setBottomGradientOpacity] = useState(1);

  const selectedIndexRef = useRef(selectedIndex);

  useEffect(() => {
    selectedIndexRef.current = selectedIndex;
  }, [selectedIndex]);

  const handleItemMouseEnter = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const handleItemClick = useCallback(
    async (index: number) => {
      setSelectedIndex(index);

      const item = items[index];

      if (item !== undefined) {
        await onItemSelect?.(item, index);
      }
    },
    [items, onItemSelect],
  );

  const handleScroll = useCallback(() => {
    const container = listRef.current;

    if (!container) {
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;

    setTopGradientOpacity(Math.min(scrollTop / 50, 1));

    const bottomDistance = scrollHeight - (scrollTop + clientHeight);

    setBottomGradientOpacity(
      scrollHeight <= clientHeight ? 0 : Math.min(bottomDistance / 50, 1),
    );
  }, []);

  /**
   * 处理方向键与 Tab 的列表导航 / Handles list navigation with arrow keys and Tab
   */
  useEffect(() => {
    if (!enableArrowNavigation) {
      return;
    }

    const handleKeyDown = async (event: KeyboardEvent) => {
      if (
        event.key === "ArrowDown" ||
        (event.key === "Tab" && !event.shiftKey)
      ) {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((currentIndex) =>
          Math.min(currentIndex + 1, items.length - 1),
        );
        return;
      }

      if (event.key === "ArrowUp" || (event.key === "Tab" && event.shiftKey)) {
        event.preventDefault();
        setKeyboardNav(true);
        setSelectedIndex((currentIndex) => Math.max(currentIndex - 1, 0));
        return;
      }

      if (event.key === "Enter") {
        const currentIndex = selectedIndexRef.current;

        if (currentIndex >= 0 && currentIndex < items.length) {
          event.preventDefault();

          const item = items[currentIndex];

          if (item !== undefined) {
            await onItemSelect?.(item, currentIndex);
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [enableArrowNavigation, items, onItemSelect]);

  /**
   * 将键盘选中的列表项滚动到可见区域 / Scrolls keyboard-selected item into view
   */
  useEffect(() => {
    const container = listRef.current;

    if (!keyboardNav || selectedIndex < 0 || !container) {
      return;
    }

    const selectedItem = container.querySelector(
      `[data-index="${selectedIndex}"]`,
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

    setKeyboardNav(false);
  }, [keyboardNav, selectedIndex]);

  useEffect(() => {
    handleScroll();
  }, [handleScroll, items.length]);

  return (
    <div className={`relative w-full max-w-[500px] ${className}`}>
      <div
        ref={listRef}
        className={`max-h-[400px] overflow-y-auto p-10 ${
          displayScrollbar
            ? "[&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded [&::-webkit-scrollbar-thumb]:bg-[#222] [&::-webkit-scrollbar-track]:bg-[#060010]"
            : "scrollbar-hide"
        }`}
        onScroll={handleScroll}
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
            selected={selectedIndex === index}
            onMouseEnter={handleItemMouseEnter}
            onClick={handleItemClick}
            itemClassName={itemClassName}
            itemHeight={itemHeight}
          >
            {renderItem ? (
              renderItem(item, index)
            ) : (
              <p className="m-0 text-white">{String(item)}</p>
            )}
          </AnimatedItem>
        ))}
      </div>

      {showGradients && (
        <>
          <div
            className="ease pointer-events-none absolute top-0 right-0 left-0 h-[50px] bg-linear-to-b from-[#060010] to-transparent transition-opacity duration-300"
            style={{ opacity: topGradientOpacity }}
          />

          <div
            className="ease pointer-events-none absolute right-0 bottom-0 left-0 h-[100px] bg-linear-to-t from-[#060010] to-transparent transition-opacity duration-300"
            style={{ opacity: bottomGradientOpacity }}
          />
        </>
      )}
    </div>
  );
}
