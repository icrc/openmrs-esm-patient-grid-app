import React, { ReactNode } from 'react';
import styles from './PageWithSidePanel.scss';

export interface PageWithSidePanelProps {
  sidePanel?: ReactNode;
  showSidePanel?: boolean;
  children?: ReactNode;
  sidePanelSize?: 'md' | 'lg';
}

export function PageWithSidePanel({
  sidePanel,
  showSidePanel,
  children,
  sidePanelSize = 'md',
}: PageWithSidePanelProps) {
  return (
    <div className={styles.main}>
      <div className={styles.mainContent}>{children}</div>
      {showSidePanel && (
        <>
          <div
            className={styles.sidePanelSpacer}
            style={{ flex: sidePanelSize === 'md' ? '0 0 420px' : '0 0 600px' }}
          />
          <div className={styles.sidePanelFloater} style={{ width: sidePanelSize === 'md' ? '420px' : '600px' }}>
            {sidePanel}
          </div>
        </>
      )}
    </div>
  );
}
