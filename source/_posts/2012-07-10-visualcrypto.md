---
layout: post
title: "视觉密码(VisualCrypto)"
description: "介绍C#的一种实现视觉密码的方式"
category: demo
tags: [C#]
cover: /cover/visualcrypto.jpg
---

先看效果图：

![效果图-1](/image/VisualCrypto/VisualCrypto_1.jpg)

将其中一个图更改透明度为50%，重叠两张图后：

![效果图-2](/image/VisualCrypto/VisualCrypto_2.jpg)

源于：[http://leemon.com/crypto/VisualCrypto.html](http://leemon.com/crypto/VisualCrypto.html)

大家可以先去看看，作者的意思是，甲乙两方需要传递消息，可以事先说好密钥，传递消息时只要给其发送stream（明文）图片即可，另一方解密，只需输入密钥和相应的消息长度（输入等量空格）即可得到ciphertext（密钥）图片，最终得到消息内容。同一张密钥图片可以匹配多张明文。


原理很简单，作者根据所给口令（PASSPHRASE），使用![基本元素-1](/image/VisualCrypto/VisualCrypto_3.jpg)和![基本元素-2](/image/VisualCrypto/VisualCrypto_4.jpg)两张图片组成了一个图片，这张图片只与口令有关。然后对于加密内容，不需要替换的地方使用相反的图片，需要替换的使用原本的图片，这样两张图片相叠就能达到需要的效果。


暂不讨论此等加密的好坏，仅看到作者在最后那一串font的Array就让我感叹。


闲来无事，也想自己写个支持中文的，于是就有了C#版的VisualCrypto

由于其中使用了caozhy的字模点阵提取程序：

参见：[http://topic.csdn.net/u/20120629/17/a33f88b5-7ee8-4a0c-8915-c0c721bb30c9.html](http://topic.csdn.net/u/20120629/17/a33f88b5-7ee8-4a0c-8915-c0c721bb30c9.html)

![效果图-3](/image/VisualCrypto/VisualCrypto_5.jpg)

![效果图-4](/image/VisualCrypto/VisualCrypto_6.jpg)

![效果图-6](/image/VisualCrypto/VisualCrypto_8.jpg)

![效果图-5](/image/VisualCrypto/VisualCrypto_7.jpg)

源码也已上传：[http://files.cnblogs.com/nanqi/VisualCryptography.zip](http://files.cnblogs.com/nanqi/VisualCryptography.zip)

## 个人思路：

首先将![基本元素-1](/image/VisualCrypto/VisualCrypto_3.jpg)和![基本元素-2](/image/VisualCrypto/VisualCrypto_4.jpg)使用私有字段`\_unit`代替

    bool[][] _unit = new bool[][] { new bool[] { true, false, false, true }, new bool[] { false, true, true, false } };

将用户输入的口令处理为`bool[256] dataCode`即16\*16的矩阵。

为true则使用第一个，为false使用第二个。最后得到`bool[1024] _resultCode`即32\*32的矩阵。

通过字模点阵获取`bool[256] dataMsg`即16\*16的矩阵。

与口令获取的`bool[256] dataCode`进行对比生成`bool[256] dataDiff`，dataMsg中为false的对dataCode取反，为true的不变。

与获得resultCode方式相同，使用dataDiff获得相应的\_resultMsg。

画出两张图。

## 具体代码：

    //密码
    byte[] code = System.Text.Encoding.Default.GetBytes(textBox1.Text.Trim());
    
    if (code.Length == 0)
    {
       code = DEF_CODE;
    }
    else if (code.Length > 16)
    {
       code = code.Take(16).ToArray();
    }
    else
    {
       while (code.Length < 4)
       {
          code = code.Concat(code).ToArray();
       }
    }
    
    code = code.Concat(DEF_CODE.Skip(code.Length)).ToArray();
    
    IEnumerable<byte> tmpDataCode = Enumerable.Empty<byte>();
    
    for (int i = 0; i < code.Length; i += 4)
    {
       tmpDataCode = tmpDataCode.Concat(SHA512Encrypt(code.Where((by, index) => (index & 3) == (i / 4 & 3)).ToArray()));
    }
    
    bool[] dataCode = tmpDataCode.Select(by => Convert.ToBoolean(by & 1)).ToArray();


    //字模
    Bitmap bmp = new Bitmap(16, 16);
    Graphics g = Graphics.FromImage(bmp);
    g.FillRectangle(Brushes.White, new Rectangle() { X = 0, Y = 0, Height = 16, Width = 16 });
    g.DrawString(textBox2.Text, textBox2.Font, Brushes.Black, Point.Empty);
    
    bool[] dataMsg = Enumerable.Range(0, 256).Select(a => new { x = a % 16, y = a / 16 })
    .Select(x => bmp.GetPixel(x.x, x.y).GetBrightness() > 0.5f ? false : true).ToArray();


    //差异
    bool[] dataDiff = dataCode.ToArray();
    
    if (dataMsg.Length == dataCode.Length)
    {
       for (int i = 0; i < dataMsg.Length; i++)
       {
          dataDiff[i] = dataMsg[i] ? dataDiff[i] : !dataDiff[i];
       }
    }
    
    //密匙
    IEnumerable<bool> tmpResultCode = Enumerable.Empty<bool>();
    
    foreach (var item in dataCode)
    {
       tmpResultCode = tmpResultCode.Concat(_unit[Convert.ToInt32(item)]);
    }
    
    _resultCode = tmpResultCode.ToArray();
    
    
    //消息
    IEnumerable<bool> tmpResultMsg = Enumerable.Empty<bool>();
    
    foreach (var item in dataDiff)
    {
       tmpResultMsg = tmpResultMsg.Concat(_unit[Convert.ToInt32(item)]);
    }


    void Draw(Graphics g, bool[] data)
    {
       for (int i = 0; i < 16; i++)
       for (int j = 0; j < 16; j++)
       for (int k = 0; k < 4; k++)
       {
          Brush brush = data[j * 4 * 16 + i * 4 + k] ? Brushes.Black : Brushes.White;
    
          if (k < 2)
             g.FillRectangle(brush, new Rectangle() { X = i * 16 + k * 8, Y = j * 16, Width = 8, Height = 8 });
          else
             g.FillRectangle(brush, new Rectangle() { X = i * 16 + (k - 2) * 8, Y = j * 16 + 8, Width = 8, Height = 8 });
       }
    }

 

源于：[http://leemon.com/crypto/VisualCrypto.html](http://leemon.com/crypto/VisualCrypto.html)

参见：[http://topic.csdn.net/u/20120629/17/a33f88b5-7ee8-4a0c-8915-c0c721bb30c9.html](http://topic.csdn.net/u/20120629/17/a33f88b5-7ee8-4a0c-8915-c0c721bb30c9.html)

源码：[http://files.cnblogs.com/nanqi/VisualCryptography.zip](http://files.cnblogs.com/nanqi/VisualCryptography.zip)

