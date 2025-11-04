import { TrendingUp, Wifi, WifiOff } from 'lucide-react';
import './Header.css';

const Header = ({ apiStatus }) => {
  return (
    <header className="header">
      <div className="container">
        <h1 className="logo">
          <TrendingUp className="logo-icon" />
          Converto
        </h1>
        <div className="status">
          {apiStatus === 'online' ? (
            <Wifi className="status-icon online" />
          ) : (
            <WifiOff className="status-icon offline" />
          )}
          <span className={`status-text ${apiStatus}`}>
            {apiStatus === 'online' ? 'Connected' : 'Offline'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
