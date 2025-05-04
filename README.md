# Silent-Comms-go

เว็บแอปพลิเคชันส่งข้อความแบบไม่ระบุตัวตน ใช้ Go สำหรับ Backend และ HTML/CSS/JavaScript สำหรับ Frontend

## สิ่งที่ต้องใช้

- Go 1.16 above

## วิธีติดตั้ง

1. Clone โปรเจค:
```bash
git clone https://github.com/Goexz/Silent-Comms-go.git
cd Silent-Comms-go
```

2. ติดตั้ง dependencies:
```bash
go mod tidy
```

## วิธีการรัน

1. รันเซิร์ฟเวอร์ Go:
```bash
go run main.go
```

2. เปิดเบราว์เซอร์และไปที่:
```
http://localhost:8080
```

## โครงสร้างโปรเจค

```
Silent-Comms-go/
├── main.go           # Backend server
├── index.html        # Frontend UI
├── style.css         # CSS styles
├── script.js         # Frontend logic
└── go.mod           # Go dependencies
```

## ข้อควรระวัง

- ข้อมูลข้อความจะถูกเก็บไว้ในหน่วยความจำเท่านั้น จะหายไปเมื่อรีสตาร์ทเซิร์ฟเวอร์
- ควรใช้ในสภาพแวดล้อมที่ปลอดภัยเท่านั้น 
