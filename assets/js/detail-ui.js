/* Wire existing frontend cards to the detail viewer. */
(function(){
  'use strict';
  function bind(){
    document.addEventListener('click', function(e){
      if(e.target.closest('.portfolio-detail-overlay')) return;
      const service=e.target.closest('#servicesGrid .service-card');
      const project=e.target.closest('#projectsGrid .project-card');
      const client=e.target.closest('#clientsGrid .client-card');
      const card=service||project||client;
      if(!card || typeof window.openPortfolioDetail!=='function') return;
      e.preventDefault();
      e.stopPropagation();
      const grid=card.parentElement;
      const cards=Array.from(grid.children);
      const position=cards.indexOf(card);
      const key=service?'services':project?'projects':'clients';
      const kind=service?'service':project?'project':'client';
      const items=window.PortfolioData && typeof window.PortfolioData.get==='function' ? window.PortfolioData.get(key) : [];
      if(!Array.isArray(items)||!items.length) return;
      const item=items[position % items.length];
      if(item) window.openPortfolioDetail(kind,item);
    }, true);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',bind); else bind();
})();
