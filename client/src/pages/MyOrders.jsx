import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import orderService from '../services/orderService';
import formatCurrency from '../utils/formatCurrency';
import formatDate from '../utils/formatDate';
import Badge from '../components/common/Badge';
import EmptyState from '../components/common/EmptyState';
import MainLayout from '../layouts/MainLayout';
import { useT } from '../context/LanguageContext';

const MyOrders = () => {
  const t = useT();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await orderService.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data);
        }
      } catch (err) {
        console.error('Error fetching order history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'Delivered':
        return 'success';
      case 'Shipped':
      case 'Processing':
      case 'Confirmed':
        return 'accent';
      case 'Cancelled':
        return 'danger';
      case 'Pending':
      default:
        return 'warning';
    }
  };

  return (
    <MainLayout>
      <div className="container" style={{ padding: '40px 20px' }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: 'var(--text-main)', marginBottom: '8px' }}>
          {t('orders.title')}
        </h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', fontSize: '0.95rem' }}>
          {t('orders.subtitle')}
        </p>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h3>{t('orders.loading')}</h3>
          </div>
        ) : orders.length === 0 ? (
          <EmptyState
            icon="📦"
            title={t('orders.emptyTitle')}
            description={t('orders.emptyText')}
            actionText={t('orders.startShopping')}
            actionLink="/shop"
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {orders.map((order) => (
              <div
                key={order._id}
                className="card"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '18px',
                }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--border-subtle)',
                    paddingBottom: '14px',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.05rem' }}>
                      {t('orders.orderNo', { id: order._id.slice(-8).toUpperCase() })}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {t('orders.placedOn', { date: formatDate(order.createdAt) })}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Badge variant={getStatusVariant(order.orderStatus)}>
                      {t(`status.${order.orderStatus}`)}
                    </Badge>
                    <span style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                      {formatCurrency(order.totalPrice)}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
                  {order.orderItems.map((item, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-sm)', objectFit: 'cover' }}
                      />
                      <div style={{ fontSize: '0.88rem' }}>
                        <div style={{ fontWeight: 700, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {item.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {t('orders.qty')} {item.quantity} × {formatCurrency(item.price)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer action */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
                  <Link to={`/orders/${order._id}`} className="btn btn-outline btn-sm">
                    {t('orders.viewDetails')}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MyOrders;
