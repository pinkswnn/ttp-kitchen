
const reveals=document.querySelectorAll('.reveal');
const io=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
},{threshold:.15});
reveals.forEach(r=>io.observe(r));
document.getElementById('year').textContent=new Date().getFullYear();
