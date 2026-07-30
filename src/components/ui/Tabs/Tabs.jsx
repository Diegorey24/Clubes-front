import styles from './Tabs.module.css';

/**
 * Tabs simples y reutilizables.
 *
 * tabs: [{ id: string, label: string }]
 *
 * Ejemplo:
 *   <Tabs
 *     tabs={[{ id: 'info', label: 'Información' }, { id: 'cc', label: 'Cuenta Corriente' }]}
 *     active={activeTab}
 *     onChange={setActiveTab}
 *   />
 */
const Tabs = ({ tabs, active, onChange }) => (
    <div className={styles.tabs}>
        {tabs.map((tab) => (
            <button
                key={tab.id}
                type="button"
                className={`${styles.tab} ${active === tab.id ? styles.active : ''}`}
                onClick={() => onChange(tab.id)}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

export default Tabs;
