var alert_space = document.getElementById('alert-space');
var publicPath = '/public';

var alertTypes = {
    warning: 'warning',
    error: 'error',
    success: 'success'
}

var alertRender = async function (msg, type, {time = 4000, animation = 700})
{
    clearAlert();
    
    let img_element = document.createElement('img');
    let msg_element = document.createElement('span');
    let close_element = document.createElement('input')

    let timer = document.createElement('div');
    timer.className = 'timer';

    if(type == alertTypes.success) {
        timer.style.backgroundColor = 'green';
    }
    
    let alert_content = document.createElement('div');
    alert_content.className = 'alert-content'; 

    close_element.type = 'submit'
    close_element.value = 'x';
    close_element.addEventListener('click', () => clearAlert());

    img_element.src = `${publicPath}/img/${type}.png`;
    msg_element.textContent = msg;

    alert_content.appendChild(img_element);
    alert_content.appendChild(msg_element);
    alert_content.appendChild(close_element);
    
    alert_space.appendChild(alert_content);
    alert_space.appendChild(timer);
    
    if(animation) await alertAnimation(animation);
    
    setTimeout(()=> {
        timer.style.transition = `width ${time}ms linear`;
        timer.style.width = '0%'
    }, animation || 1);
    setTimeout(()=> {
        clearAlert(animation);
    }, time + animation);
}

const clearAlert = (animation) => {
    if(animation) {
        alertAnimation(animation, true)
        setTimeout(()=>{
            alert_space.innerHTML = ''
        }, animation)
        return;
    };

    alert_space.innerHTML = ''
};
async function alertAnimation(time, exist)
{
    if(exist){
        alert_space.style.width = 0;
        return;
    }

    alert_space.style.width = 0
    let width = '400px';

    setTimeout(()=> {
        alert_space.style.transition = `width ${time}ms linear`;
        alert_space.style.width = width;
    }, 1);
}