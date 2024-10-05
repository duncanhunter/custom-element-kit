const getParentNode = (node) => {
	if (node?.nodeName === "html") return node;
	const result =
		node.assignedSlot ||
		node.parentNode ||
		node?.host ||
		document.documentElement;
	return result?.host || result;
};

const getNearestOverflowAncestor = (node) => {
	const parentNode = getParentNode(node);
	if (parentNode === null || parentNode === document.body) {
		return null;
	}
	const isOverflowElement = (element) => {
		return (
			element.scrollHeight > element.clientHeight ||
			element.scrollWidth > element.clientWidth
		);
	};
	return isOverflowElement(parentNode)
		? parentNode
		: getNearestOverflowAncestor(parentNode);
};

const getOverflowAncestors = (nodes) => {
	const overflowAncestors = new Set();
	const visitedNodes = new Set();
	const queue = [...nodes];

	while (queue.length > 0) {
		const currentNode = queue.shift();

		if (visitedNodes.has(currentNode)) {
			continue;
		}

		visitedNodes.add(currentNode);

		const scrollableAncestor = getNearestOverflowAncestor(currentNode);

		if (scrollableAncestor) {
			overflowAncestors.add(scrollableAncestor);
			queue.push(scrollableAncestor);
		}
	}

	return [window, document.body, ...overflowAncestors];
};

const observeMove = (element, onMove) => {
	let intersectionObserver = null;
	let timeoutId;
	const root = document.documentElement;

	const cleanup = () => {
		clearTimeout(timeoutId);
		intersectionObserver?.disconnect();
	};

	const refresh = (skip = false, threshold = 1) => {
		cleanup();

		const { left, top, width, height } = element.getBoundingClientRect();

		if (!skip) onMove();
		if (!width || !height) return;

		const rootMargin = `${-Math.floor(top)}px ${-Math.floor(root.clientWidth - (left + width))}px ${-Math.floor(root.clientHeight - (top + height))}px ${-Math.floor(left)}px`;
		const options = {
			rootMargin,
			threshold: Math.max(0, Math.min(1, threshold)) || 1,
		};
		let isFirstUpdate = true;

		const handleObserve = ([entry]) => {
			const ratio = entry.intersectionRatio;
			if (ratio !== threshold) {
				if (!isFirstUpdate) return refresh();
				timeoutId = setTimeout(() => refresh(false, ratio || 1e-7), 1000);
			}
			isFirstUpdate = false;
		};

		intersectionObserver = new IntersectionObserver(handleObserve, {
			...options,
			root: root.ownerDocument || root,
		});
		intersectionObserver.observe(element);
	};

	refresh(true);
	return cleanup;
};

export const autoUpdate = (anchor, popover, onUpdate) => {
	const ancestors = getOverflowAncestors([anchor, popover]);

	for (const ancestor of ancestors) {
		ancestor.addEventListener("scroll", onUpdate, { passive: true });
		ancestor.addEventListener("resize", onUpdate);
	}

	const cleanupIntersectionObserver = observeMove(anchor, onUpdate);

	const resizeObserver = new ResizeObserver(([entry]) => {
		if (entry.target === anchor) {
			resizeObserver.unobserve(popover);
			requestAnimationFrame(() => resizeObserver.observe(popover));
		}
		onUpdate();
	});

	resizeObserver.observe(anchor);
	resizeObserver.observe(popover);
	onUpdate();

	return () => {
		for (const ancestor of ancestors) {
			ancestor.removeEventListener("scroll", onUpdate);
			ancestor.removeEventListener("resize", onUpdate);
		}
		cleanupIntersectionObserver();
		resizeObserver.disconnect();
	};
};

export const createPopover = ({
	anchorElement,
	popoverElement,
	placement = "bottom-start",
	offset = 0,
	popoverWidth = "anchor-width",
}) => {
	let hoverBridge;
	let cleanup;

	const updatePosition = () => {
		const anchorRect = anchorElement.getBoundingClientRect();
		const popoverRect = popoverElement.getBoundingClientRect();
		const shadowRoot = popoverElement.getRootNode();
		if (popoverWidth === "anchor-width") {
			popoverElement.style.width = `${anchorRect.width}px`;
		} else if (
			popoverWidth === "include-previous-sibling" &&
			shadowRoot.host.previousElementSibling
		) {
			const previousSibling = shadowRoot.host.previousElementSibling;
			const siblingWidth = previousSibling.offsetWidth;
			popoverElement.style.width = `${anchorRect.width + siblingWidth}px`;
		} else if (popoverWidth === "content-width") {
			popoverElement.style.width = "content-width";
		}
		const enoughRoomBelow =
			window.innerHeight - anchorRect.bottom >= popoverElement.scrollHeight;
		const enoughRoomAbove = anchorRect.top >= popoverElement.scrollHeight;
		const enoughRoomRight =
			window.innerWidth - anchorRect.right - offset >= popoverRect.width;
		const enoughRoomLeft = anchorRect.left - offset >= popoverRect.width;
		if (!enoughRoomBelow && !enoughRoomAbove) {
			popoverElement.style.overflow = "scroll";
			popoverElement.style.maxHeight = `${window.innerHeight - anchorRect.bottom - offset - 6}px`;
		} else {
			popoverElement.style.maxHeight = "unset";
		}
		if (offset > 0 && !hoverBridge) {
			hoverBridge = document.createElement("div");
			hoverBridge.style.position = "fixed";
			hoverBridge.setAttribute("part", "hover-bridge");
			popoverElement.appendChild(hoverBridge);
		}
		if (offset < 0 && hoverBridge) {
			hoverBridge.style.display = "none";
		}

		switch (placement) {
			case "left-start": {
				popoverElement.style.top =
					enoughRoomLeft || enoughRoomRight
						? `${anchorRect.top}px`
						: `${anchorRect.bottom}px`;
				popoverElement.style.left = enoughRoomLeft
					? `${anchorRect.left - popoverRect.width - offset}px` //`${anchorRect.right + offset}px`
					: enoughRoomRight
						? `${anchorRect.right + offset}px`
						: `${anchorRect.left}px`;
				if (offset > 0 && (enoughRoomLeft || enoughRoomRight)) {
					hoverBridge.style.display = "block";
					hoverBridge.style.width = `${offset}px`;
					hoverBridge.style.top = `${anchorRect.top}px`;
					hoverBridge.style.left =
						enoughRoomLeft || !enoughRoomRight
							? `${popoverRect.right}px`
							: `${popoverRect.left - offset}px`;

					if (anchorRect.height > popoverRect.height) {
						const popoverPercentageOfAnchor =
							(popoverRect.height / anchorRect.height) * 100;
						hoverBridge.style.clipPath = enoughRoomLeft
							? `polygon(0 0, 100% 0, 100% 100%, 0 ${popoverPercentageOfAnchor}%)`
							: `polygon(0 0, 100% 0, 100% ${popoverPercentageOfAnchor}%, 0 100%)`;
						hoverBridge.style.height = `${anchorRect.height}px`;
					} else {
						hoverBridge.style.clipPath = enoughRoomLeft
							? `polygon(0 0, 100% 0, 100% ${(anchorRect.height / popoverRect.height) * 100}%, 0 100%`
							: `polygon(0 0, 100% 0, 100% 100%, 0 ${(anchorRect.height / popoverRect.height) * 100}%)`;
						hoverBridge.style.height = `${popoverRect.height}px`;
					}
				} else if (offset > 0) {
					hoverBridge.style.display = "none";
				}
				break;
			}
			case "left-end": {
				hoverBridge.style.display = "block";
				popoverElement.style.top =
					enoughRoomLeft || enoughRoomRight
						? `${anchorRect.bottom - popoverRect.height}px`
						: `${anchorRect.bottom}px`;
				popoverElement.style.left = enoughRoomLeft
					? `${anchorRect.left - popoverRect.width - offset}px`
					: enoughRoomRight
						? `${anchorRect.right + offset}px`
						: `${anchorRect.left}px`;
				if (offset > 0 && (enoughRoomLeft || enoughRoomRight)) {
					hoverBridge.style.width = `${offset}px`;
					hoverBridge.style.left =
						enoughRoomLeft || !enoughRoomRight
							? `${popoverRect.right}px`
							: `${popoverRect.left - offset}px`;

					if (anchorRect.height > popoverRect.height) {
						const popoverPercentageOfAnchor =
							(popoverRect.height / anchorRect.height) * 100;
						hoverBridge.style.clipPath = enoughRoomLeft
							? `polygon(0 ${100 - popoverPercentageOfAnchor}%, 100% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% ${100 - popoverPercentageOfAnchor}%, 100% 100%, 0 100%`;
						hoverBridge.style.height = `${anchorRect.height}px`;
						hoverBridge.style.top = `${anchorRect.top}px`;
					} else {
						const anchorPercentageOfPopover =
							(anchorRect.height / popoverRect.height) * 100;
						hoverBridge.style.clipPath = enoughRoomLeft
							? `polygon(0 0, 100% ${100 - anchorPercentageOfPopover}%, 100% 100%, 0 100%`
							: `polygon(0 ${100 - anchorPercentageOfPopover}%, 100% 0, 100% 100%, 0 100%)`;
						hoverBridge.style.height = `${popoverRect.height}px`;
						hoverBridge.style.top = `${anchorRect.bottom - popoverRect.height}px`;
					}
				} else if (offset > 0) {
					hoverBridge.style.display = "none";
				}
				break;
			}
			case "left": {
				const anchorCenterY =
					anchorRect.top + anchorRect.height / 2 - popoverRect.height / 2;
				popoverElement.style.top =
					enoughRoomLeft || enoughRoomRight
						? `${anchorCenterY}px`
						: `${anchorRect.bottom}px`;
				popoverElement.style.left = enoughRoomLeft
					? `${anchorRect.left - popoverRect.width - offset}px`
					: enoughRoomRight
						? `${anchorRect.right + offset}px`
						: `${anchorRect.left}px`;
				if (offset > 0 && (enoughRoomLeft || enoughRoomRight)) {
					hoverBridge.style.display = "block";
					hoverBridge.style.width = `${offset}px`;
					hoverBridge.style.left = enoughRoomLeft
						? `${popoverRect.right}px`
						: `${popoverRect.left - offset}px`;

					if (anchorRect.height > popoverRect.height) {
						const popoverPercentageOfAnchor =
							((popoverRect.height / anchorRect.height) * 100) / 2;
						const popoverStartPercentage = 50 - popoverPercentageOfAnchor;
						const popoverEndPercentage = 50 + popoverPercentageOfAnchor;

						hoverBridge.style.clipPath = enoughRoomLeft
							? `polygon(0 ${popoverStartPercentage}%, 100% 0, 100% 100%, 0 ${popoverEndPercentage}%)`
							: `polygon(0 0, 100% ${popoverStartPercentage}%, 100% ${popoverEndPercentage}%, 0 100%)`;
						hoverBridge.style.top = `${anchorRect.top}px`;
						hoverBridge.style.height = `${anchorRect.height}px`;
					} else {
						const anchorPercentageOfPopover =
							((anchorRect.height / popoverRect.height) * 100) / 2;
						const anchorStartPercentage = 50 - anchorPercentageOfPopover;
						const anchorEndPercentage = 50 + anchorPercentageOfPopover;

						hoverBridge.style.clipPath = enoughRoomLeft
							? `polygon(0 0, 100% ${anchorStartPercentage}%, 100% ${anchorEndPercentage}%, 0 100%)`
							: `polygon(0 ${anchorStartPercentage}%, 100% 0, 100% 100%, 0 ${100 - anchorStartPercentage}%)`;
						hoverBridge.style.top = `${popoverRect.top}px`;
						hoverBridge.style.height = `${popoverRect.height}px`;
					}
				} else if (offset > 0) {
					hoverBridge.style.display = "none";
				}
				break;
			}
			case "right-start": {
				popoverElement.style.top =
					enoughRoomLeft || enoughRoomRight
						? `${anchorRect.top}px`
						: `${anchorRect.bottom}px`;
				popoverElement.style.left = enoughRoomRight
					? `${anchorRect.right + offset}px`
					: enoughRoomLeft
						? `${anchorRect.left - popoverRect.width - offset}px`
						: `${anchorRect.left}px`;
				if (offset > 0 && (enoughRoomLeft || enoughRoomRight)) {
					hoverBridge.style.display = "block";
					hoverBridge.style.width = `${offset}px`;
					hoverBridge.style.top = `${anchorRect.top}px`;
					hoverBridge.style.left =
						enoughRoomRight || !enoughRoomLeft
							? `${popoverRect.left - offset}px`
							: `${popoverRect.right}px`;

					if (anchorRect.height > popoverRect.height) {
						const popoverPercentageOfAnchor =
							(popoverRect.height / anchorRect.height) * 100;
						hoverBridge.style.clipPath = enoughRoomRight
							? `polygon(0 0, 100% 0, 100% ${popoverPercentageOfAnchor}%, 0 100%)`
							: `polygon(0 0, 100% 0, 100% 100%, 0 ${popoverPercentageOfAnchor}%)`;
						hoverBridge.style.height = `${anchorRect.height}px`;
					} else {
						hoverBridge.style.clipPath = enoughRoomRight
							? `polygon(0 0, 100% 0, 100% 100%, 0 ${(anchorRect.height / popoverRect.height) * 100}%)`
							: `polygon(0 0, 100% 0, 100% ${(anchorRect.height / popoverRect.height) * 100}%, 0 100%`;
						hoverBridge.style.height = `${popoverRect.height}px`;
					}
				} else if (offset > 0) {
					hoverBridge.style.display = "none";
				}
				break;
			}
			case "right-end": {
				hoverBridge.style.display = "block";
				popoverElement.style.top =
					enoughRoomLeft || enoughRoomRight
						? `${anchorRect.bottom - popoverRect.height}px`
						: `${anchorRect.bottom}px`;
				popoverElement.style.left = enoughRoomRight
					? `${anchorRect.right + offset}px`
					: enoughRoomLeft
						? `${anchorRect.left - popoverRect.width - offset}px`
						: `${anchorRect.left}px`;
				if (offset > 0 && (enoughRoomLeft || enoughRoomRight)) {
					hoverBridge.style.width = `${offset}px`;
					hoverBridge.style.left =
						enoughRoomRight || !enoughRoomLeft
							? `${popoverRect.left - offset}px`
							: `${popoverRect.right}px`;

					if (anchorRect.height > popoverRect.height) {
						const popoverPercentageOfAnchor =
							(popoverRect.height / anchorRect.height) * 100;
						hoverBridge.style.clipPath = enoughRoomRight
							? `polygon(0 0, 100% ${100 - popoverPercentageOfAnchor}%, 100% 100%, 0 100%`
							: `polygon(0 ${100 - popoverPercentageOfAnchor}%, 100% 0, 100% 100%, 0 100%)`;
						hoverBridge.style.height = `${anchorRect.height}px`;
						hoverBridge.style.top = `${anchorRect.top}px`;
					} else {
						const anchorPercentageOfPopover =
							(anchorRect.height / popoverRect.height) * 100;
						hoverBridge.style.clipPath = enoughRoomRight
							? `polygon(0 ${100 - anchorPercentageOfPopover}%, 100% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% ${100 - anchorPercentageOfPopover}%, 100% 100%, 0 100%`;
						hoverBridge.style.height = `${popoverRect.height}px`;
						hoverBridge.style.top = `${anchorRect.bottom - popoverRect.height}px`;
					}
				} else if (offset > 0) {
					hoverBridge.style.display = "none";
				}
				break;
			}
			case "right": {
				const anchorCenterY =
					anchorRect.top + anchorRect.height / 2 - popoverRect.height / 2;
				popoverElement.style.top =
					enoughRoomLeft || enoughRoomRight
						? `${anchorCenterY}px`
						: `${anchorRect.bottom}px`;
				popoverElement.style.left = enoughRoomRight
					? `${anchorRect.right + offset}px`
					: enoughRoomLeft
						? `${anchorRect.left - popoverRect.width - offset}px`
						: `${anchorRect.left}px`;
				if (offset > 0 && (enoughRoomLeft || enoughRoomRight)) {
					hoverBridge.style.display = "block";
					hoverBridge.style.width = `${offset}px`;
					hoverBridge.style.left = enoughRoomRight
						? `${popoverRect.left - offset}px`
						: `${popoverRect.right}px`;

					if (anchorRect.height > popoverRect.height) {
						const popoverPercentageOfAnchor =
							((popoverRect.height / anchorRect.height) * 100) / 2;
						const popoverStartPercentage = 50 - popoverPercentageOfAnchor;
						const popoverEndPercentage = 50 + popoverPercentageOfAnchor;

						hoverBridge.style.clipPath = enoughRoomRight
							? `polygon(0 0, 100% ${popoverStartPercentage}%, 100% ${popoverEndPercentage}%, 0 100%)`
							: `polygon(0 ${popoverStartPercentage}%, 100% 0, 100% 100%, 0 ${popoverEndPercentage}%)`;
						hoverBridge.style.top = `${anchorRect.top}px`;
						hoverBridge.style.height = `${anchorRect.height}px`;
					} else {
						const anchorPercentageOfPopover =
							((anchorRect.height / popoverRect.height) * 100) / 2;
						const anchorStartPercentage = 50 - anchorPercentageOfPopover;
						const anchorEndPercentage = 50 + anchorPercentageOfPopover;

						hoverBridge.style.clipPath = enoughRoomRight
							? `polygon(0 ${anchorStartPercentage}%, 100% 0, 100% 100%, 0 ${100 - anchorStartPercentage}%)`
							: `polygon(0 0, 100% ${anchorStartPercentage}%, 100% ${anchorEndPercentage}%, 0 100%)`;
						hoverBridge.style.top = `${popoverRect.top}px`;
						hoverBridge.style.height = `${popoverRect.height}px`;
					}
				} else if (offset > 0) {
					hoverBridge.style.display = "none";
				}
				break;
			}
			case "top-start":
				popoverElement.style.top = enoughRoomAbove
					? `${anchorRect.top - popoverRect.height - offset}px`
					: `${anchorRect.bottom + offset}px`;
				popoverElement.style.left = `${anchorRect.left}px`;
				if (offset > 0) {
					hoverBridge.style.height = `${offset}px`;
					hoverBridge.style.width = `${Math.max(anchorRect.width, popoverRect.width)}px`;
					hoverBridge.style.top = enoughRoomAbove
						? `${anchorRect.top - offset}px`
						: `${anchorRect.bottom}px`;
					hoverBridge.style.left = `${anchorRect.left}px`;

					if (anchorRect.width > popoverRect.width) {
						const popoverEndPercentage =
							(popoverRect.width / anchorRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomAbove
							? `polygon(0 0, ${popoverEndPercentage}% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% 0, ${popoverEndPercentage}% 100%, 0 100%)`;
					} else {
						const anchorEndPercentage =
							(anchorRect.width / popoverRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomAbove
							? `polygon(0 0, 100% 0, ${anchorEndPercentage}% 100%, 0 100%)`
							: `polygon(0 0, ${anchorEndPercentage}% 0, 100% 100%, 0 100%)`;
					}
				}
				break;
			case "top-end":
				popoverElement.style.top = enoughRoomAbove
					? `${anchorRect.top - popoverRect.height - offset}px`
					: `${anchorRect.bottom + offset}px`;
				popoverElement.style.left = `${anchorRect.right - popoverRect.width}px`;
				if (offset > 0) {
					hoverBridge.style.height = `${offset}px`;
					hoverBridge.style.width = `${Math.max(anchorRect.width, popoverRect.width)}px`;
					hoverBridge.style.top = enoughRoomAbove
						? `${anchorRect.top - offset}px`
						: `${anchorRect.bottom}px`;
					hoverBridge.style.left = `${anchorRect.right - Math.max(anchorRect.width, popoverRect.width)}px`;

					if (anchorRect.width > popoverRect.width) {
						const popoverStartPercentage =
							100 - (popoverRect.width / anchorRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomAbove
							? `polygon(${popoverStartPercentage}% 0, 100% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% 0, 100% 100%, ${popoverStartPercentage}% 100%)`;
					} else {
						const anchorStartPercentage =
							100 - (anchorRect.width / popoverRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomAbove
							? `polygon(0 0, 100% 0, 100% 100%, ${anchorStartPercentage}% 100%)`
							: `polygon(${anchorStartPercentage}% 0, 100% 0, 100% 100%, 0 100%)`;
					}
				}
				break;
			case "top": {
				popoverElement.style.top = enoughRoomAbove
					? `${anchorRect.top - popoverRect.height - offset}px`
					: `${anchorRect.bottom + offset}px`;
				const popoverWidth = popoverRect.width;
				const anchorCenter = anchorRect.left + anchorRect.width / 2;
				const popoverLeft = anchorCenter - popoverWidth / 2;
				popoverElement.style.left = `${popoverLeft}px`;

				if (offset > 0) {
					hoverBridge.style.height = `${offset}px`;
					hoverBridge.style.width = `${popoverRect.width}px`;
					hoverBridge.style.top = enoughRoomAbove
						? `${anchorRect.top - offset}px`
						: `${anchorRect.bottom}px`;

					if (anchorRect.width > popoverRect.width) {
						const popoverLeftRelativeToAnchor =
							popoverRect.left - anchorRect.left;
						const popoverRightRelativeToAnchor =
							popoverRect.right - anchorRect.left;
						const popoverStartPercentage =
							(popoverLeftRelativeToAnchor / anchorRect.width) * 100;
						const popoverEndPercentage =
							(popoverRightRelativeToAnchor / anchorRect.width) * 100;

						hoverBridge.style.clipPath = enoughRoomAbove
							? `polygon(${popoverStartPercentage}% 0, ${popoverEndPercentage}% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% 0, ${popoverEndPercentage}% 100%, ${popoverStartPercentage}% 100%)`;
						hoverBridge.style.left = `${anchorRect.left}px`;
						hoverBridge.style.width = `${anchorRect.width}px`;
					} else {
						const anchorLeftRelativeToPopover =
							anchorRect.left - popoverRect.left;
						const anchorRightRelativeToPopover =
							anchorRect.right - popoverRect.left;
						const anchorLeftPercentage =
							(anchorLeftRelativeToPopover / popoverRect.width) * 100;
						const anchorRightPercentage =
							(anchorRightRelativeToPopover / popoverRect.width) * 100;

						hoverBridge.style.clipPath = enoughRoomAbove
							? `polygon(0 0, 100% 0, ${anchorRightPercentage}% 100%, ${anchorLeftPercentage}% 100%)`
							: `polygon(${anchorLeftPercentage}% 0, ${anchorRightPercentage}% 0, 100% 100%, 0 100%)`;
						hoverBridge.style.left = `${popoverLeft}px`;
					}
				}
				break;
			}
			case "bottom": {
				popoverElement.style.top = enoughRoomBelow
					? `${anchorRect.bottom + offset}px`
					: `${anchorRect.top - popoverRect.height - offset}px`;
				const popoverWidth = popoverRect.width;
				const anchorCenter = anchorRect.left + anchorRect.width / 2;
				const popoverLeft = anchorCenter - popoverWidth / 2;
				popoverElement.style.left = `${popoverLeft}px`;

				if (offset > 0) {
					hoverBridge.style.height = `${offset}px`;
					hoverBridge.style.width = `${popoverRect.width}px`;
					hoverBridge.style.top = enoughRoomBelow
						? `${anchorRect.bottom}px`
						: `${anchorRect.top - offset}px`;

					if (anchorRect.width > popoverRect.width) {
						const popoverLeftRelativeToAnchor =
							popoverRect.left - anchorRect.left;
						const popoverRightRelativeToAnchor =
							popoverRect.right - anchorRect.left;
						const popoverStartPercentage =
							(popoverLeftRelativeToAnchor / anchorRect.width) * 100;
						const popoverEndPercentage =
							(popoverRightRelativeToAnchor / anchorRect.width) * 100;

						hoverBridge.style.clipPath = enoughRoomBelow
							? `polygon(0 0, 100% 0, ${popoverEndPercentage}% 100%, ${popoverStartPercentage}% 100%)`
							: `polygon(${popoverStartPercentage}% 0, ${popoverEndPercentage}% 0, 100% 100%, 0 100%)`;
						hoverBridge.style.left = `${anchorRect.left}px`;
						hoverBridge.style.width = `${anchorRect.width}px`;
					} else {
						const anchorLeftRelativeToPopover =
							anchorRect.left - popoverRect.left;
						const anchorRightRelativeToPopover =
							anchorRect.right - popoverRect.left;
						const anchorLeftPercentage =
							(anchorLeftRelativeToPopover / popoverRect.width) * 100;
						const anchorRightPercentage =
							(anchorRightRelativeToPopover / popoverRect.width) * 100;

						hoverBridge.style.clipPath = enoughRoomBelow
							? `polygon(${anchorLeftPercentage}% 0, ${anchorRightPercentage}% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% 0, ${anchorRightPercentage}% 100%, ${anchorLeftPercentage}% 100%)`;
						hoverBridge.style.left = `${popoverLeft}px`;
					}
				}
				break;
			}
			case "bottom-start":
				popoverElement.style.top =
					enoughRoomBelow || !enoughRoomAbove
						? `${anchorRect.bottom + offset}px`
						: `${anchorRect.top - popoverRect.height - offset}px`;
				popoverElement.style.left = `${anchorRect.left}px`;
				if (offset > 0) {
					hoverBridge.style.height = `${offset}px`;
					hoverBridge.style.width = `${Math.max(anchorRect.width, popoverRect.width)}px`;
					hoverBridge.style.top = enoughRoomBelow
						? `${anchorRect.bottom}px`
						: `${anchorRect.top - offset}px`;
					hoverBridge.style.left = `${anchorRect.left}px`;

					if (anchorRect.width > popoverRect.width) {
						const popoverEndPercentage =
							(popoverRect.width / anchorRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomBelow
							? `polygon(0 0, 100% 0, ${popoverEndPercentage}% 100%, 0 100%)`
							: `polygon(0 0, ${popoverEndPercentage}% 0, 100% 100%, 0 100%)`;
					} else {
						const anchorEndPercentage =
							(anchorRect.width / popoverRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomBelow
							? `polygon(0 0, ${anchorEndPercentage}% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% 0, ${anchorEndPercentage}% 100%, 0 100%)`;
					}
				}
				break;
			case "bottom-end":
				popoverElement.style.top =
					enoughRoomBelow || !enoughRoomAbove
						? `${anchorRect.bottom + offset}px`
						: `${anchorRect.top - popoverRect.height - offset}px`;
				popoverElement.style.left = `${anchorRect.right - popoverRect.width}px`;
				if (offset > 0) {
					hoverBridge.style.height = `${offset}px`;
					hoverBridge.style.width = `${Math.max(anchorRect.width, popoverRect.width)}px`;
					hoverBridge.style.top = enoughRoomBelow
						? `${anchorRect.bottom}px`
						: `${anchorRect.top - offset}px`;
					hoverBridge.style.left = `${anchorRect.right - Math.max(anchorRect.width, popoverRect.width)}px`;

					if (anchorRect.width > popoverRect.width) {
						const popoverEndPercentage =
							100 - (popoverRect.width / anchorRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomBelow
							? `polygon(0 0, 100% 0, 100% 100%, ${popoverEndPercentage}% 100%)`
							: `polygon(${popoverEndPercentage}% 0, 100% 0, 100% 100%, 0 100%)`;
					} else {
						const anchorEndPercentage =
							100 - (anchorRect.width / popoverRect.width) * 100;
						hoverBridge.style.clipPath = enoughRoomBelow
							? `polygon( ${anchorEndPercentage}% 0, 100% 0, 100% 100%, 0 100%)`
							: `polygon(0 0, 100% 0, 100% 100%, ${anchorEndPercentage}% 100%)`;
					}
				}
		}
	};

	const startAutoUpdatePosition = () => {
		updatePosition();
		cleanup = autoUpdate(anchorElement, popoverElement, updatePosition);
		if (hoverBridge) {
			hoverBridge.style.display = "block";
		}
	};

	const stopAutoUpdatePosition = () => {
		cleanup();
		if (hoverBridge) {
			hoverBridge.style.display = "none";
		}
	};

	return {
		updatePosition,
		startAutoUpdatePosition,
		stopAutoUpdatePosition,
	};
};
