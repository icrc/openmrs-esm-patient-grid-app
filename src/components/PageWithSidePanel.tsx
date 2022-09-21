import React, { ReactNode } from 'react';
import styles from './PageWithSidePanel.scss';

export interface PageWithSidePanelProps {
  sidePanel?: ReactNode;
  showSidePanel?: boolean;
  children?: ReactNode;
}

export function PageWithSidePanel({ sidePanel, showSidePanel, children }: PageWithSidePanelProps) {
  return (
    <div className={styles.main}>
      <div className={styles.mainContent}>{children}</div>
      {showSidePanel && (
        <>
          <div className={styles.sidePanelSpacer} />
          <div className={styles.sidePanelFloater}>{sidePanel}</div>
        </>
      )}
    </div>
  );
}
