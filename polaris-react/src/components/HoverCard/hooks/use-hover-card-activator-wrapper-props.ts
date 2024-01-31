import {useRef, useEffect, useState, useCallback} from 'react';

import {useEphemeralPresenceManager} from '../../../utilities/ephemeral-presence-manager';
import {useBreakpoints} from '../../../utilities/breakpoints';
import {classNames} from '../../../utilities/css';
import styles from '../HoverCard.module.scss';

const HOVER_OUT_TIMEOUT = 200;

export function useHoverCardActivatorWrapperProps({
  snapToParent,
  ref: providedActivatorRef,
  toggleActive,
}: {
  snapToParent?: boolean;
  ref?: React.RefObject<HTMLElement | null>;
  toggleActive?(active: boolean): void;
}) {
  const hoverDelayTimeout = useRef<NodeJS.Timeout | null>(null);
  const hoverOutTimeout = useRef<NodeJS.Timeout | null>(null);
  const mouseEntered = useRef(false);
  const dynamicActivatorRef = useRef<HTMLElement | null>(null);

  const {mdUp} = useBreakpoints();

  const {presenceList, addPresence, removePresence} =
    useEphemeralPresenceManager();

  const [activatorNode, setActivatorNode] = useState<HTMLElement | null>(null);
  const [overlayActive, setOverlayActive] = useState(false);

  useEffect(() => {
    if (
      !activatorNode &&
      providedActivatorRef &&
      providedActivatorRef.current
    ) {
      setActivatorNode(providedActivatorRef.current);
    }
  }, [providedActivatorRef, activatorNode]);

  useEffect(() => {
    const currentHoverDelayTimeout = hoverDelayTimeout?.current;
    const currentHoverOutTimeout = hoverOutTimeout?.current;

    return () => {
      if (currentHoverDelayTimeout) {
        clearTimeout(currentHoverDelayTimeout);
      }
      if (currentHoverOutTimeout) {
        clearTimeout(currentHoverOutTimeout);
      }
    };
  }, []);

  const handleOpen = useCallback(() => {
    toggleActive?.(true);
    addPresence('hovercard');
  }, [toggleActive, addPresence]);

  const handleClose = useCallback(() => {
    hoverOutTimeout.current = setTimeout(() => {
      removePresence('hovercard');
    }, HOVER_OUT_TIMEOUT);

    toggleActive?.(false);
  }, [toggleActive, removePresence]);

  const handleMouseLeaveActivator = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      const isTarget = event.currentTarget?.getAttribute(
        'data-hovercard-activator',
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - EventTarget does in fact have a parentNode property. Since this event is also fired when the row is entered, we continue only if the cell itself was entered.
      const isTargetChild = event.target?.parentNode?.getAttribute(
        'data-hovercard-activator',
      );

      if (isTarget || isTargetChild) {
        const mouseEnteredHoverCard =
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore - EventTarget does in fact have a parentNode property. Since this event is also fired when the row is entered, we continue only if the cell itself was entered.
          event?.relatedTarget?.parentNode?.getAttribute(
            'data-hovercard-content',
          );

        if (mouseEnteredHoverCard) console.log('mouse entered hover card');

        dynamicActivatorRef.current = null;
        mouseEntered.current = false;

        if (mouseEnteredHoverCard || overlayActive) {
          return;
        }

        console.log('mouse left activator');

        if (hoverDelayTimeout.current) {
          clearTimeout(hoverDelayTimeout.current);
          hoverDelayTimeout.current = null;
        }

        handleClose();
      }
    },
    [handleClose, overlayActive, hoverDelayTimeout, mouseEntered],
  );

  const handleMouseEnter = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!mdUp) return;
      if (!providedActivatorRef) {
        dynamicActivatorRef.current = event.currentTarget;
      }

      mouseEntered.current = true;

      if (!presenceList.hovercard) {
        hoverDelayTimeout.current = setTimeout(() => {
          handleOpen();
        }, 100);
      } else {
        handleOpen();
      }
    },
    [handleOpen, hoverDelayTimeout, presenceList, mdUp, providedActivatorRef],
  );

  // https://github.com/facebook/react/issues/10109
  // Mouseenter event not triggered when cursor moves from disabled button
  const handleMouseEnterFix = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      console.log(
        event,
        event.target,
        event.currentTarget,
        event.relatedTarget,
      );

      const isTarget = event.currentTarget?.getAttribute(
        'data-hovercard-activator',
      );

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore - EventTarget does in fact have a parentNode property. Since this event is also fired when the row is entered, we continue only if the cell itself was entered.
      const isTargetChild = event.target?.parentNode?.getAttribute(
        'data-hovercard-activator',
      );

      if (isTarget || isTargetChild) {
        console.log('mouse entered activator');

        if (!mouseEntered.current) {
          handleMouseEnter(event);
        }
      }
    },
    [handleMouseEnter],
  );

  const handleMouseEnterOverlay = () => {
    setOverlayActive(true);
  };

  const handleMouseLeaveOverlay = () => {
    console.log('mouse left hover card');
    handleClose();
    setOverlayActive(false);
  };

  const className = classNames(
    styles.ActivatorWrapper,
    snapToParent && styles.snapToParent,
  );

  return {
    className,
    overlayActive,
    isDesktop: mdUp,
    present: presenceList.hovercard,
    activatorElement: dynamicActivatorRef?.current ?? activatorNode,
    setActivatorNode,
    handleMouseLeaveActivator,
    handleMouseEnterActivator: handleMouseEnterFix,
    handleMouseEnterOverlay,
    handleMouseLeaveOverlay,
  };
}
