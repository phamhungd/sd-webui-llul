(function() {
    
    if (!globalThis.LLuL) globalThis.LLuL = {};
    const LLuL = globalThis.LLuL;
    
    function id(type, s) {
        return `llul-${type}-${s}`;
    }

    function isDark() {
        return gradioApp().querySelector('.dark') !== null;
    }

    const M = 2;
    function setSize(canvas, width, height) {
        width = Math.floor(+width / M);
        height = Math.floor(+height / M);
        if (canvas.width != width) canvas.width = width;
        if (canvas.height != height) canvas.height = height;
    }

    function updateXY(canvas) {
        let x = +canvas.dataset.x,
            y = +canvas.dataset.y,
            w = +canvas.width,
            h = +canvas.height;
        if (x < 0) x = 0;
        if (w/2 < x) x = Math.floor(w/2);
        if (y < 0) y = 0;
        if (h/2 < y) y = Math.floor(h/2);
        
        canvas.dataset.x = x;
        canvas.dataset.y = y;
    }
    
    function draw(canvas) {
        const
            x = +canvas.dataset.x,
            y = +canvas.dataset.y,
            w = +canvas.width,
            h = +canvas.height;
        
            const ctx = canvas.getContext('2d');
        
        const bgcolor = isDark() ? 'black' : 'white';
        ctx.fillStyle = bgcolor;
        ctx.fillRect(0, 0, +canvas.width, +canvas.height);
        
        ctx.fillStyle = 'gray';
        ctx.fillRect(x, y, Math.floor(w/2), Math.floor(h/2));
    }

    async function update_gradio(type, canvas) {
        await LLuL.js2py(type, 'x', +canvas.dataset.x * M);
        await LLuL.js2py(type, 'y', +canvas.dataset.y * M);
    }
    
    function init(type) {
        const $ = x => gradioApp().querySelector(x);
        const cont = $('#' + id(type, 'container'))
        const x = $('#' + id(type, 'x'))
        const y = $('#' + id(type, 'y'))
        if (!cont || !x || !y) return false;

        const width = $(`#${type}_width input[type=number]`);
        const height = $(`#${type}_height input[type=number]`);
        
        const canvas = document.createElement('canvas');
        canvas.style.border = '1px solid gray';
        canvas.dataset.x = Math.floor(+width.value / 4 / M);
        canvas.dataset.y = Math.floor(+height.value / 4 / M);

        for (let ele of [width, height]) {
            ele.addEventListener('change', e => {
                setSize(canvas, width.value, height.value);
                updateXY(canvas);
                draw(canvas);
            });
        }

        let dragging = false;
        let last_x, last_y;
        canvas.addEventListener('pointerdown', e => {
            e.preventDefault();
            dragging = true;
            last_x = e.offsetX;
            last_y = e.offsetY;
        });
        canvas.addEventListener('pointerup', async e => {
            e.preventDefault();
            dragging = false;
            await update_gradio(type, canvas);
        });
        canvas.addEventListener('pointermove', e => {
            if (!dragging) return;
            const dx = e.offsetX - last_x, dy = e.offsetY - last_y;
            const x = +canvas.dataset.x, y = +canvas.dataset.y;
            canvas.dataset.x = x + dx;
            canvas.dataset.y = y + dy;
            last_x = e.offsetX;
            last_y = e.offsetY;
            updateXY(canvas);
            draw(canvas);
        });

        cont.appendChild(canvas);
        setSize(canvas, width.value, height.value);
        updateXY(canvas);
        draw(canvas);

        return true;
    }
    
    onUiUpdate(() => {
        if (!LLuL.txt2img) {
            LLuL.txt2img = init('txt2img');
        }
        
        if (!LLuL.img2img) {
            LLuL.img2img = init('img2img');
        }
    });

})();
