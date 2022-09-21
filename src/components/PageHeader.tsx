import React, { ReactNode } from 'react';
import styles from './PageHeader.scss';

export interface PageHeaderProps {
  title?: ReactNode;
  actions?: ReactNode;
  subTitle?: ReactNode;
}

export function PageHeader({ title, subTitle, actions }: PageHeaderProps) {
  return (
    <header className={styles.headerContainer}>
      <div>{title}</div>
      <div className={styles.actionsContainer}>{actions}</div>
      {subTitle && <div className={styles.subTitleContainer}>{subTitle}</div>}
    </header>
  );
}
