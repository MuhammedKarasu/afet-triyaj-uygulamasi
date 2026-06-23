# AfetSaha — Acil Durum ve Saha Yönetimi

AfetSaha; deprem ve afet sonrasında sahadaki yaralıların hızla kayıt altına alınmasını, temel sağlık verilerine göre otomatik triyaj önceliği oluşturulmasını ve saha ekiplerinin müdahale sürecini yönetmesini sağlayan eğitim amaçlı bir karar destek sistemidir. Repo, mevcut Next.js web panelini ve V3.0 Expo mobil uygulamasını birlikte içerir.

> **Tıbbi uyarı:** Bu proje tıbbi teşhis sistemi değildir. Üretilen risk seviyesi eğitim ve karar destek amaçlıdır; yetkili sağlık personelinin klinik değerlendirmesinin yerine geçmez.

## V3.0 Mobil Sürüm Açıklaması

V3.0 ile web uygulaması korunurken [`mobile/`](mobile/) klasöründe iPhone odaklı, gerçek React Native uygulaması eklendi. Mobil sürüm App Store veya TestFlight kullanmadan Expo Go içinde çalışır.

- iPhone safe area, notch ve home indicator uyumlu yerleşim
- Ana Sayfa, Kayıt Ekle, Yaralılar, Ekipler ve Profil alt sekmeleri
- Dört adımlı, tek elle kullanıma uygun hızlı yaralı kaydı
- Web sürümüyle aynı kırmızı/sarı/yeşil/siyah-gri risk kuralları
- Yaralı detayı, risk gerekçesi ve ayrı müdahale güncelleme akışı
- AsyncStorage ile cihazda kalıcı demo verileri ve çevrimdışı kullanım
- Splash, giriş, logo ve illüstrasyon için marka yerleşimleri

## iPhone'da Çalıştırma Rehberi

Bu akış için Mac, Xcode, Apple geliştirici hesabı, App Store yayını veya TestFlight gerekmez.

1. iPhone'da App Store'u açın ve **Expo Go** uygulamasını kurun/güncelleyin.
2. Bilgisayar ve iPhone'u aynı Wi-Fi ağına bağlayın.
3. PowerShell veya terminalde proje klasörüne, ardından mobil klasöre geçin:

```powershell
cd C:\Users\karas\Documents\Afetyönetimimobiluygulama\mobile
```

4. Bağımlılıkları kurun ve Expo geliştirme sunucusunu başlatın:

```bash
npm install
npx expo start --lan
```

Kısa komut olarak `npm run start:lan` da kullanılabilir.

5. Terminalde veya açılan Expo geliştirici ekranında görünen QR kodunu iPhone Kamera uygulamasıyla okutun.
6. Bildirime dokunun ve bağlantıyı **Expo Go** ile açın.
7. AfetSaha splash ekranından sonra **Demo kullanıcı ile devam et** seçeneğini kullanın.

Windows Güvenlik Duvarı ilk çalıştırmada ağ izni sorarsa özel ağlar için Node.js/Expo erişimine izin verin. QR kodu açılmıyorsa iki cihazın aynı ağda olduğunu ve VPN'in kapalı olduğunu kontrol edin.

### Expo Go ile test adımları

1. Demo kullanıcıyla giriş yapın.
2. Alt menüden **Kayıt Ekle** sekmesini açın.
3. Nabız `138`, SpO₂ `86` ve kanama durumunu **Şiddetli** girin.
4. Son adımda canlı risk analizinin **Kırmızı** olduğunu gösterin.
5. Kaydı tamamlayıp yaralı detayındaki risk gerekçesini açın.
6. **Müdahale durumunu güncelle** ile durumu **Müdahale Edildi** yapın.
7. Ana Sayfa metriklerinin ve müdahale geçmişinin güncellendiğini gösterin.

## Mobil demo kullanıcı bilgileri

| Alan | Değer |
|---|---|
| E-posta | `admin@afet.local` |
| Parola | `Admin123!` |
| Rol | Admin |

Mobil giriş ekranındaki hızlı demo düğmesi aynı hesabı otomatik açar.

## Mobil kullanılan teknolojiler

| Katman | Teknoloji |
|---|---|
| Mobil uygulama | Expo SDK 56, React Native, TypeScript |
| Navigasyon | Expo Router, alt sekme + stack/modal akışı |
| Form ve doğrulama | React Hook Form, Zod |
| Yerel veri | AsyncStorage |
| Arayüz | React Native StyleSheet tasarım sistemi, Expo Vector Icons |

## Logo ve görsel alanları

Mobil giriş ve splash ekranlarında tasarım bozulmadan kullanılabilecek placeholder alanlar bulunur. Kaynak dosya beklentileri [`mobile/assets/placeholders/README.md`](mobile/assets/placeholders/README.md) içinde belgelenmiştir.

- Uygulama logosu: `1024 × 1024`
- Giriş illüstrasyonu: `1600 × 2000`
- Splash / launch tasarımı: `1290 × 2796`

## Bilinen sırlamalar

- Mobil veriler yalnızca kullanılan iPhone/Expo Go cihazında saklanır; web SQLite veritabanıyla otomatik senkronize edilmez.
- Expo geliştirme sunucusunun ilk açılışta çalışıyor olması gerekir. JavaScript paketi yüklendikten sonra yerel demo verileri çevrimdışı kalır.
- Uygulama App Store/TestFlight dağıtımı için yapılandırılmamıştır.
- Gerçek kimlik doğrulama, çoklu cihaz senkronizasyonu ve merkezi denetim kaydı bu demo sürümünün dışındadır.

## V3.0 gelecek geliştirmeler

- Web ve mobil arasında güvenli API tabanlı senkronizasyon
- Expo Location ile izinli GPS konum alma ve gerçek harita
- QR bileklik, fotoğraf eki ve çevrimdışı işlem kuyruğu
- Bildirimler ve ekip görev kabul akışı
- Kurumsal logo/illüstrasyon dosyalarının nihai tasarımlarla değiştirilmesi

## Öne çıkan özellikler

- Admin, sağlık personeli ve gönüllü için çalışan rol tabanlı demo oturumu
- Gerçek SQLite verilerinden anlık hesaplanan operasyon dashboard'u
- React Hook Form ve Zod ile Türkçe doğrulama mesajlarına sahip yaralı formu
- Hayati bulguları analiz eden, ayrı ve test edilebilir risk hesaplama motoru
- Kırmızı vakaları önceleyen arama ve filtreleme destekli yaralı listesi
- Risk gerekçesi, müdahale geçmişi, ekip ataması ve durum güncelleme ekranı
- Aktif/pasif ekip, görev bölgesi, üye ve atama takibi
- GPS koordinatlarını şematik saha haritasında gösteren konum ekranı
- 3 kullanıcı, 3 ekip ve 10 yaralıdan oluşan sunuma hazır demo verisi
- Responsive sidebar, mobil uyumlu kartlar ve profesyonel Türkçe arayüz

## V2 UI/UX Güncellemeleri

- Daha sakin renk paleti, gerçek Inter yazı tipi ve tutarlı aralık sistemi
- Mobilde açılır menüye dönüşen, rol tabanlı ve gruplandırılmış sidebar
- Daha kompakt dashboard metrikleri, sade risk grafiği ve odaklı acil müdahale kuyruğu
- Yalnızca karar için gerekli özeti gösteren, renk kodlu yaralı kartları
- Arama ve filtreleri tek bir responsive kontrol alanında birleştiren liste deneyimi
- Yaralı kayıt formunda kişisel bilgiler, hayati bulgular, durum bilgileri ve konum/notlar için dört adımlı bölüm yapısı
- Risk, durum, boş ekran, form bölümü ve içerik kartları için tekrar kullanılabilir bileşenler
- Klavye odağı, dokunma alanları, okunabilir metin boyutları ve yumuşatılmış risk renkleriyle iyileştirilmiş erişilebilirlik

## Kullanılan teknolojiler

| Katman | Teknoloji |
|---|---|
| Uygulama | Next.js 15, React 19, TypeScript |
| Arayüz | Tailwind CSS, Lucide Icons |
| Form | React Hook Form, Zod |
| Veritabanı | SQLite, Prisma ORM |
| Grafik | Recharts 3 |
| Sunucu | Next.js Server Actions ve Route Handlers |

## Kurulum

### Gereksinimler

- Node.js 20 LTS veya üzeri
- npm 10 veya üzeri (Node.js ile birlikte gelir)

Kuruluma başlamadan önce terminalde sürümleri kontrol edin:

```bash
node --version
npm --version
```

Komutlar bulunamıyorsa [Node.js LTS](https://nodejs.org/) sürümünü kurun ve terminali yeniden açın. Proje Windows 11 üzerinde Node.js `v24.14.0` ve npm `v11.17.0` ile doğrulanmıştır.

### Standart kurulum

Önce ortam dosyasını oluşturun.

Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

macOS / Linux:

```bash
cp .env.example .env
```

Ardından bağımlılıkları ve demo veritabanını kurup geliştirme sunucusunu başlatın:

```bash
npm install
npm run db:setup
npm run dev
```

Terminalde `Ready` mesajı göründüğünde tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın. Geliştirme sunucusunu durdurmak için `Ctrl+C` kullanın.

Projede npm tarafından üretilmiş `package-lock.json` bulunduğu için sonraki temiz kurulumlarda `npm ci` de kullanılabilir:

```bash
npm ci
npm run db:setup
npm run dev
```

### Tek komutla demo

Bağımlılıklar kurulduktan sonra veritabanını sıfırlayıp demo verilerini yükleyerek uygulamayı başlatmak için:

```bash
npm run demo
```

> `npm run demo` mevcut demo kayıtlarını sıfırlar. Günlük geliştirmede verileri korumak için `npm run dev` kullanın.

### Ortam değişkenleri

`.env` dosyası Git'e eklenmez. `.env.example` dosyasını kopyalayarak aşağıdaki yerel ayarları oluşturun:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECURE="false"
```

HTTPS ile yayın yaparken `SESSION_SECURE` değerini `true` olarak ayarlayın.

## Veritabanı komutları

```bash
# Prisma Client üret
npx prisma generate

# Şemayı SQLite veritabanına uygula
npm run db:push

# Sunum verilerini yükle / sıfırla
npm run db:seed

# Şema ve seed işlemini birlikte çalıştır
npm run db:setup
```

Temel tablolar:

- `User`: demo kullanıcılar ve roller
- `Patient`: yaralı, hayati bulgu, risk ve güncel müdahale durumu
- `Intervention`: zaman damgalı müdahale geçmişi
- `Team`: saha ekibi, üyeler ve görev bölgesi
- `TeamAssignment`: ekip–yaralı atamaları

## Demo kullanıcıları

| Rol | E-posta | Parola | Yetki özeti |
|---|---|---|---|
| Admin | `admin@afet.local` | `Admin123!` | Tüm ekranlar, ekip oluşturma, durum güncelleme |
| Sağlık Personeli | `saglik@afet.local` | `Saglik123!` | Triyaj, müdahale güncelleme ve ekip atama |
| Gönüllü | `gonullu@afet.local` | `Gonullu123!` | Dashboard, kayıt oluşturma ve salt okunur detay |

Oturum sistemi bilinçli olarak final demosuna uygun, hafif bir yapıda tutulmuştur. Üretim ortamında parola hashleme, Auth.js benzeri bir kimlik sağlayıcı, CSRF politikası ve denetim kaydı eklenmelidir.

## Risk analiz kuralları

Kurallar [`src/lib/risk.ts`](src/lib/risk.ts) içinde arayüzden ve veritabanından bağımsız bir fonksiyon olarak tanımlanmıştır. Öncelik sırası:

1. Yaşam belirtisi veya solunum yoksa **Siyah / Gri**
2. Bilinç kapalı, SpO₂ <%90, nabız >130 veya şiddetli kanama varsa **Kırmızı**
3. SpO₂ %90–94, nabız 100–130, yürüyememe, bilinç bulanıklığı, kontrollü kanama veya solunum güçlüğü varsa **Sarı**
4. Bu bulgular yoksa **Yeşil**

Birden fazla bulgu bulunduğunda en yüksek öncelik seçilir ve ilgili tüm gerekçeler hasta kaydına yazılır. Risk sonucu istemcide önizlenir; güvenlik için sunucuda yeniden hesaplanır.

## Final sunumu demo senaryosu

1. Giriş ekranındaki **Admin** hızlı demo hesabıyla oturum açın.
2. Dashboard'daki toplam ve kırmızı vaka sayılarını gösterin.
3. **Yeni Yaralı Kaydı** ekranını açın.
4. Örnek bir ad, yaş ve konum girin.
5. Nabız alanına `138`, SpO₂ alanına `86` yazın.
6. Kanama durumunu **Şiddetli** seçin.
7. Form altındaki canlı önizlemenin **Kırmızı — Acil müdahale** olduğunu ve gerekçeleri gösterin.
8. **Risk Analizi Yap ve Kaydet** düğmesine basın.
9. Detay ekranındaki risk gerekçesini gösterin.
10. Dashboard'a dönerek toplam ve kırmızı vaka sayısının arttığını gösterin.
11. Yeni kaydın detayına girin, müdahale notu ekleyin ve durumu **Müdahale Edildi** yapın.
12. Müdahale geçmişini ve dashboard'da güncellenen tamamlanmış işlem sayısını gösterin.

İkinci kısa akış olarak sağlık personeliyle durum güncellenebildiğini, gönüllü hesabında ise ekip menüsü ve müdahale formunun gizlendiğini gösterebilirsiniz.

## Proje yapısı

```text
prisma/
  schema.prisma       # Veritabanı şeması
  seed.ts             # Sunuma hazır demo verileri
src/
  app/
    (dashboard)/      # Korumalı uygulama ekranları
    api/patients/     # Sunucu tarafı kayıt uç noktası
    actions.ts        # Rol kontrollü sunucu işlemleri
  components/         # Tekrar kullanılabilir arayüz bileşenleri
  lib/
    auth.ts           # Hafif demo oturumu ve yetki kontrolü
    risk.ts           # Saf risk analiz algoritması
    validations.ts    # Zod form şemaları
    prisma.ts         # Prisma Client örneği
```

## Kalite kontrolleri

```bash
npm run typecheck
npm run build
npm run start
```

`npm run start`, production build tamamlandıktan sonra uygulamayı [http://localhost:3000](http://localhost:3000) üzerinde çalıştırır.

Proje; temiz `npm install`, Prisma kurulumu, TypeScript kontrolü, production build ve `npm run dev` üzerinden giriş → kırmızı triyaj kaydı → dashboard güncellemesi → müdahale tamamlama akışıyla doğrulanmıştır.

## Sık karşılaşılan sorunlar

### `npm` veya `node` komutu bulunamıyor

Node.js LTS sürümünü kurun, açık terminalleri kapatıp yeniden açın ve `node --version` ile `npm --version` komutlarını tekrar çalıştırın.

### 3000 portu kullanımda

```bash
npm run dev -- -p 3001
```

Bu durumda uygulamayı `http://localhost:3001` adresinden açın.

### Windows'ta Prisma `EPERM` hatası

Çalışan geliştirme sunucusunu `Ctrl+C` ile durdurun ve ardından:

```bash
npx prisma generate
npm run dev
```

Prisma motoru çalışan bir Node.js işlemi tarafından kullanılırken yeniden kurulmaya çalışılırsa Windows dosyayı kilitleyebilir.

## Geliştirme fikirleri

- Leaflet veya Mapbox ile gerçek harita ve kümeleme
- Çevrimdışı kayıt ve bağlantı gelince senkronizasyon
- Hasta QR bilekliği ve hızlı tarama
- Ekipler için canlı konum ve görev kabul akışı
- PDF vaka raporu ve CSV dışa aktarma
- Auth.js, hashlenmiş parolalar ve ayrıntılı denetim kayıtları
