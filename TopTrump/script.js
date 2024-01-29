// script.js
function saveChanges() {
    document.getElementById('nameTag').textContent = document.getElementById('nameInput').value;
    document.getElementById('autismStat').textContent = document.getElementById('autismInput').value;
    document.getElementById('musicTalentStat').textContent = document.getElementById('musicTalentInput').value;
    document.getElementById('bigStat').textContent = document.getElementById('bigInput').value;
    document.getElementById('drinkingCapabilityStat').textContent = document.getElementById('drinkingCapabilityInput').value;
    document.getElementById('wealthStat').textContent = document.getElementById('wealthInput').value;
}

document.getElementById('imageUpload').addEventListener('change', function(event){
    var file = event.target.files[0];
    var reader = new FileReader();

    reader.onload = function(e) {
        var img = document.createElement("img");
        img.src = e.target.result;
        img.id = 'uploadedImage';
        document.getElementById('uploadedImageContainer').innerHTML = '';
        document.getElementById('uploadedImageContainer').appendChild(img);
        makeImageDraggable();
    };

    reader.readAsDataURL(file);
});

function makeImageDraggable() {
    interact('#uploadedImage').draggable({
        inertia: true,
        modifiers: [
            interact.modifiers.restrictRect({
                restriction: 'parent',
                endOnly: true
            })
        ],
        autoScroll: true,
        onmove: dragMoveListener
    })
    .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        inertia: true
    })
    .on('resizemove', function (event) {
        var target = event.target;
        var x = (parseFloat(target.getAttribute('data-x')) || 0);
        var y = (parseFloat(target.getAttribute('data-y')) || 0);

        target.style.width  = event.rect.width + 'px';
        target.style.height = event.rect.height + 'px';

        x += event.deltaRect.left;
        y += event.deltaRect.top;

        target.style.transform = 'translate(' + x + 'px,' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    });
}

function dragMoveListener(event) {
    var target = event.target;
    var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
    var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

    target.style.transform = 'translate(' + x + 'px, ' + y + 'px)';

    target.setAttribute('data-x', x);
    target.setAttribute('data-y', y);
}

window.onload = function() {
    saveChanges();
};
