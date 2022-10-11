import React, { ReactNode } from 'react';
import { Header, HeaderName, HeaderGlobalBar, Button } from '@carbon/react';
import { Close } from '@carbon/react/icons';
import styles from './SidePanel.scss';
import { useTranslation } from 'react-i18next';

export interface SidePanelProps {
  title?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  onClose?(): void;
}

export function SidePanel({ title, children, footer, onClose }: SidePanelProps) {
  const { t } = useTranslation();

  return (
    <div className={styles.sidePanel}>
      <Header className={styles.header} aria-label="Workspace Title">
        <HeaderName prefix="">{title}</HeaderName>
        <HeaderGlobalBar className={styles.headerGlobalBar}>
          <Button
            iconDescription={t('sidePanelClose', 'Close')}
            hasIconOnly
            kind="ghost"
            onClick={onClose}
            renderIcon={(props) => <Close size={16} {...props} />}
            tooltipPosition="bottom"
          />
        </HeaderGlobalBar>
      </Header>
      <section className={styles.sidePanelChildrenContainer}>{children}</section>
      <section>{footer}</section>
    </div>
  );
}
