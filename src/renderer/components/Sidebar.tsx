import { pluginRegistry } from "@/plugins/pluginRegistry";
import logo from "@/assets/icon.png";

interface SidebarProps {
  activeId: string;
  onSelect: (id: string) => void;
}

export function Sidebar({ activeId, onSelect }: SidebarProps): JSX.Element {
  const plugins = pluginRegistry.getAll();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <img src={logo} alt="Starvent" />
        <span className="sidebar__brand-name">Starvent</span>
      </div>
      <nav className="sidebar__nav">
        {plugins.map((plugin) => (
          <button
            key={plugin.id}
            type="button"
            className="sidebar__link"
            data-active={plugin.id === activeId}
            onClick={() => onSelect(plugin.id)}
          >
            <span className="sidebar__icon" aria-hidden="true">
              {plugin.icon}
            </span>
            <span>{plugin.label}</span>
          </button>
        ))}
      </nav>

      {/* Fixed brand signature — always visible at the bottom of the
          sidebar, on every module/page, never scrolls away. */}
      <div className="sidebar__footer">
        <span className="sidebar__footer-line" aria-hidden="true" />
        <span className="sidebar__footer-text">از یک ایده تا یک محصول جهانی؛ Starvent شریک خلق فناوری‌های آینده است</span>
      </div>
    </aside>
  );
}
