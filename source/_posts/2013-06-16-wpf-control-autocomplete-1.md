---
layout: post
title: "WPF控件开发(2)"
subtitle: "自动完成(AutoComplete)-1"
description: "使用WPF实现自动完成功能，以百度首页为例，做了一个简单的dem"
category: demo
tags: [C#, WPF]
cover: cover/suggestion.jpg
---

自动完成功能使用范围很广，多以TextBox或ComboBox的形式出现，在输入的同时给予候选词，候选词一般有两种方式获取。  

* 一种类似Baidu，Google，Bing之类的搜索引擎所用的直接给予前十个候选词，或者VS等IDE的自动完成，这种多以文本输入为准，候选词只作为·候选·所用；
* 较之第一种，管理类软件中可能会以筛选的形式出现。与第一种不同之处，就是这里可能注重的是选择一条数据，输入的文本只是用来·筛选·。

由此可看出，自动完成功能，就是为了提高用户体验，如果稍稍留心，会发现我们使用操作系统，软件，浏览器的时候，有各式各样的自动完成功能。  

## 百度首页

---

我本想只做一个简单的例子，不涉及界面部分，但是一时兴起，做了一个山寨版的百度首页，界面费了不少时间。  

![百度首页](http://img.youyag.com/blog/image/wpf/baidu.png)

由于这里使用的是TextBox，所以重写了TextBox的模板，给里面放了一个Popup一个ListBox，然后对一些键盘鼠标事件进行操作，基本不难理解，至于Suggestion服务，就是解析json对象的问题，这里用现成的东西。  

    public string[] GetItems(string textPattern)
    {
        string _uriFormat = @"http://suggestion.baidu.com/su?wd={0}";
        WebRequest request = null;
        WebResponse response = null;
        try
        {
            var uri = new Uri(string.Format(_uriFormat, HttpUtility.UrlEncode(textPattern)));
            request = WebRequest.Create(uri);
            try
            {
                response = request.GetResponse();
            }
            catch
            {
                return null;
            }
            object[] jsonResult;
            using (var stream = response.GetResponseStream())
            {
                var reader = new StreamReader(stream, Encoding.Default);
                var json = reader.ReadToEnd();
                Regex rege = new Regex(@"s:(\[.*\])");
                var mat = rege.Match(json).Groups[1];
                jsonResult = _jsonSerializer.DeserializeObject(mat.Value) as object[];
            }
    
            return jsonResult.Cast<string>().ToArray();
        }
        finally
        {
            if (response != null)
            {
                response.Close();
            }
            if (request != null)
            {
                request.Abort();
            }
        }
    }
    

![Suggestion](http://img.youyag.com/blog/image/wpf/suggestion.png)

## 输入缓冲

---

关于输入缓冲，早在做ComboBox的时候就需要。  
所谓输入缓冲，在这里的意思就是不在每次文本改变的时候去根据输入查询，而是有一定的缓冲，因为可能我需要的是12306，而不是123的结果。  

当然，实现方式也有很多，这里我只是使用了Timer实现。  

    _interval.Elapsed += (s1, e1) =>
    {
        _interval.Stop();
        _isKeyEvent = false;
    
        string input = string.Empty;
        txtSearch.Dispatcher.Invoke(new Action(() => input = txtSearch.Text));
        var lst = GetItems(input);
        _listSuggestion.Dispatcher.Invoke(new Action(() => _listSuggestion.ItemsSource = lst));
        _popupSuggestion.Dispatcher.Invoke(new Action(() => _popupSuggestion.IsOpen = lst.Length > 0));
    };

其实就是将原本在TextChanged事件处理函数里的代码挪到Elapsed事件里面来，TextChanged里面只需要判断是否是键盘输入，是的话就让他重置一次：  

    if (_isKeyEvent)
    {
        _interval.Stop();
        _interval.Start();
    }


## 所遇问题

---

我曾经在一篇[介绍ComboBox的博客](/blog/2013/03/29/winform-wpf-2/)中说了使用ComboBox做自动完成功能时遇到的问题，这次与ComboBox自是不相同，但是也遇到不少问题。  

1. Popup，ListBox与TextBox操作出现的问题
2. Popup展开时切换窗口
3. 鼠标选择ListBox某一条
4. 逻辑焦点在ListBox，输入焦点在TextBox上

其实与其把这些说成WPF的问题，不如说是WPF灵活的一种表现，所幸这些常见的问题都有相应的解决方案。  

看源码学习确实很好，但是往往源码过于复杂，根本无从看起，这时候就应该以最小功能去实现，然后碰到问题看他人是如何解决。  
其实软件发展到今天，很多东西早有人已经实现，认认真真看完一篇宏伟的工程，有时比自己一个劲的瞎琢磨要好的多。  
