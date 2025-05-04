let currentUserUuid = '';
let lastMessageCount = 0;
let lastMessages = [];

function formatThaiDateTime(date) {
    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    
    const day = date.getDate();
    const month = thaiMonths[date.getMonth()];
    const year = date.getFullYear() + 543; // แปลงเป็น พ.ศ.
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${day} ${month} ${year} ${hours}:${minutes}`;
}

window.onload = async function() {
    try {
        const savedUuid = localStorage.getItem('userUuid');
        if (savedUuid) {
            currentUserUuid = savedUuid;
            document.getElementById('userUuid').textContent = currentUserUuid;
            loadMessages();
            return;
        }

        await generateNewUuid();
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการสร้าง UUID');
    }
}

async function generateNewUuid() {
    try {
        const response = await fetch('http://localhost:8080/generate-uuid');
        const data = await response.json();
        currentUserUuid = data.uuid;
        localStorage.setItem('userUuid', currentUserUuid);
        document.getElementById('userUuid').textContent = currentUserUuid;
        loadMessages();
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการสร้าง UUID');
    }
}

async function changeUuid() {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะเปลี่ยน UUID? ข้อความเก่าจะไม่สามารถเข้าถึงได้')) {
        return;
    }
    await generateNewUuid();
    showNotification('เปลี่ยน UUID สำเร็จ', 'UUID ใหม่ของคุณพร้อมใช้งานแล้ว');
}

function copyUuid() {
    const uuidText = document.getElementById('userUuid').textContent;
    navigator.clipboard.writeText(uuidText).then(() => {
        showNotification('คัดลอกสำเร็จ', 'คัดลอก UUID ไปยังคลิปบอร์ดแล้ว');
    }).catch(() => {
        showNotification('เกิดข้อผิดพลาด', 'ไม่สามารถคัดลอก UUID ได้');
    });
}

async function deleteMessage(messageId) {
    if (!confirm('คุณแน่ใจหรือไม่ที่จะลบข้อความนี้?')) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/messages/${messageId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            // ลบข้อความออกจาก lastMessages
            lastMessages = lastMessages.filter(msg => msg.id !== messageId);
            lastMessageCount = lastMessages.length;
            loadMessages();
            showNotification('ลบข้อความสำเร็จ', 'ข้อความถูกลบเรียบร้อยแล้ว');
        } else {
            alert('เกิดข้อผิดพลาดในการลบข้อความ');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
}

async function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const receiverUuidInput = document.getElementById('receiverUuid');
    const message = messageInput.value.trim();
    const receiverUuid = receiverUuidInput.value.trim();
    
    if (!message) {
        alert('กรุณากรอกข้อความ');
        return;
    }

    if (!receiverUuid) {
        alert('กรุณากรอก UUID ของผู้รับ');
        return;
    }

    try {
        const response = await fetch('http://localhost:8080/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                receiverUuid: receiverUuid
            })
        });

        if (response.ok) {
            messageInput.value = '';
            receiverUuidInput.value = '';
            loadMessages();
            showNotification('ส่งข้อความสำเร็จ', 'ข้อความของคุณถูกส่งไปแล้ว');
        } else {
            alert('เกิดข้อผิดพลาดในการส่งข้อความ');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์');
    }
}

async function loadMessages() {
    try {
        const response = await fetch(`http://localhost:8080/messages/${currentUserUuid}`);
        const messages = await response.json();
        
        // ตรวจสอบข้อความใหม่
        if (messages.length > lastMessageCount && lastMessageCount > 0) {
            const newMessages = messages.slice(lastMessageCount);
            newMessages.forEach(msg => {
                showNotification('ข้อความใหม่', msg.message);
            });
        }
        
        // ตรวจสอบข้อความที่เปลี่ยนแปลง
        messages.forEach((msg, index) => {
            if (!lastMessages[index] || lastMessages[index].id !== msg.id) {
                showNotification('ข้อความอัพเดท', msg.message);
            }
        });
        
        lastMessageCount = messages.length;
        lastMessages = messages;
        
        const messagesList = document.getElementById('messagesList');
        messagesList.innerHTML = '';
        
        messages.forEach(msg => {
            const messageDiv = document.createElement('div');
            messageDiv.className = 'message';
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-header">
                        <span class="timestamp">${formatThaiDateTime(new Date(msg.timestamp))}</span>
                    </div>
                    <div class="message-text">
                        <p>${msg.message}</p>
                    </div>
                    <button class="delete-btn" onclick="deleteMessage('${msg.id}')" title="ลบข้อความ">🗑️</button>
                </div>
            `;
            messagesList.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Error:', error);
        alert('เกิดข้อผิดพลาดในการโหลดข้อความ');
    }
}

function showNotification(title, message) {
    // สร้าง notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.innerHTML = `
        <div class="notification-icon">💬</div>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <div class="notification-close">×</div>
    `;

    // เพิ่ม notification เข้าไปใน body
    document.body.appendChild(notification);

    // เพิ่ม event listener สำหรับปุ่มปิด
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'notificationSlideIn 0.3s ease-out reverse';
        setTimeout(() => notification.remove(), 300);
    });

    // ลบ notification อัตโนมัติหลังจาก 5 วินาที
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'notificationSlideIn 0.3s ease-out reverse';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// โหลดข้อความทุก 5 วินาที
setInterval(() => {
    if (currentUserUuid) {
        loadMessages();
    }
}, 5000); 