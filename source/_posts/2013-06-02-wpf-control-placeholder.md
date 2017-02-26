---
layout: post
title: "WPF控件开发(1)"
subtitle: "TextBox占位符"
description: "介绍WPF中做一个TextBox占位符的几种实现方法"
category: demo
tags: [C#, WPF]
---

在twitter-bootstrap中有这么一个功能：
<form class="form-horizontal">
<div class="control-group">
    <label class="control-label" for="inputEmail">Email</label>
    <div class="controls">
      <input type="text" id="inputEmail" placeholder="Email">
    </div>
</div>
</form>

我们如何在WPF也实现类似这种写法：

    <TextBox local:placeholder="请输入筛选条件..." />

首先熟悉一点WPF的人都知道，placeholder在这里是一个附加属性，而这个附加属性的类型是String。  

##第一种实现方式

---

首先我们想到的可能是这样：

    public static string GetPlaceholder1(DependencyObject obj)
    {
        return (string)obj.GetValue(Placeholder1Property);
    }

    public static void SetPlaceholder1(DependencyObject obj, string value)
    {
        obj.SetValue(Placeholder1Property, value);
    }

    public static readonly DependencyProperty Placeholder1Property =
        DependencyProperty.RegisterAttached("Placeholder1", typeof(string), typeof(TextBoxHelper),
            new UIPropertyMetadata(string.Empty, new PropertyChangedCallback(OnPlaceholder1Changed)));

    public static void OnPlaceholder1Changed(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        TextBox txt = d as TextBox;
        if (txt == null || e.NewValue.ToString().Trim().Length == 0) return;

        RoutedEventHandler loadHandler = null;
        loadHandler = (s1, e1) =>
        {
            txt.Loaded -= loadHandler;

            if (txt.Text.Length == 0)
            {
                txt.Text = e.NewValue.ToString();
                txt.FontStyle = FontStyles.Italic;
                txt.Foreground = Brushes.Gray;
            }
        };

        txt.Loaded += loadHandler;

        txt.GotFocus += (s1, e1) =>
        {
            if (txt.Text == e.NewValue.ToString())
            {
                txt.Clear();
                txt.FontStyle = FontStyles.Normal;
                txt.Foreground = SystemColors.WindowTextBrush;
            }
        };

        txt.LostFocus += (s1, e1) =>
        {
            if (txt.Text.Length == 0)
            {
                txt.Text = e.NewValue.ToString();
                txt.FontStyle = FontStyles.Italic;
                txt.Foreground = Brushes.Gray;
            }
        };
    }

基本存在以下几个问题：

* 获得焦点取消了占位符，与需求（twitter-bootstrap）不符，这里需要当输入内容以后才取消占位符；
* 如果这里某人恰巧也输入了”请输入筛选条件...”，当再次获得焦点的时候就会清空输入的内容，当然这一条完全可以再给一个标示去判断，比如在GotFocus的判断中，增加一个：

<pre>
txt.GotFocus += (s1, e1) =>
{
    if (txt.Text == e.NewValue.ToString()
     && txt.FontStyle == FontStyles.Italic
     && txt.Foreground == Brushes.Gray)
    {
        txt.Clear();
        txt.FontStyle = FontStyles.Normal;
        txt.Foreground = SystemColors.WindowTextBrush;
    }
};
</pre>

* 接之而来的问题就是如果TextBox恰巧需要设置FontStyle或Foreground，此时就无能为力；
* 其实最重要的问题还是，当我没有输入内容时，获取TextBox的Text属性，总有一个我不需要的值，或许加个判断可以搞定，但是这不是一个好的方式；

##使用装饰器实现-1

---

上面实现方式所带来的弊端，可以使用装饰器解决。  
首先定义一个装饰器，它可能是这样：

    public class PlaceholderAdorner1 : Adorner
    {
        string _placeholder;

        public PlaceholderAdorner1(UIElement ele, string placeholder)
            : base(ele)
        {
            _placeholder = placeholder;
        }
      
        protected override void OnRender(DrawingContext drawingContext)
        {
            TextBox txt = this.AdornedElement as TextBox;
            if (txt == null || !txt.IsVisible || string.IsNullOrEmpty(_placeholder)) return;

            this.IsHitTestVisible = false;

            drawingContext.DrawText(
                new FormattedText
                (
                    _placeholder, 
                    CultureInfo.CurrentCulture,
                    txt.FlowDirection,
                    new Typeface(txt.FontFamily, FontStyles.Italic, txt.FontWeight, txt.FontStretch),
                    txt.FontSize,
                    Brushes.Gray
                ),
                new Point(4, 2));
        }
    }

思路很简单，记录下这个占位符，然后给TextBox指定位置画出来。  
这时候，附加属性可能是这样：

    public static string GetPlaceholder2(DependencyObject obj)
    {
        return (string)obj.GetValue(Placeholder2Property);
    }

    public static void SetPlaceholder2(DependencyObject obj, string value)
    {
        obj.SetValue(Placeholder2Property, value);
    }

    public static readonly DependencyProperty Placeholder2Property =
        DependencyProperty.RegisterAttached("Placeholder2", typeof(string), typeof(TextBoxHelper), 
            new UIPropertyMetadata(string.Empty, new PropertyChangedCallback(OnPlaceholder2Changed)));

    public static void OnPlaceholder2Changed(DependencyObject d, DependencyPropertyChangedEventArgs e)
    {
        TextBox txt = d as TextBox;
        if (txt == null || e.NewValue.ToString().Trim().Length == 0) return;

        RoutedEventHandler loadHandler = null;
        loadHandler = (s1, e1) =>
        {
            txt.Loaded -= loadHandler;

            var lay = AdornerLayer.GetAdornerLayer(txt);
            if (lay == null) return;

            Adorner[] ar = lay.GetAdorners(txt);
            if (ar != null)
            {
                for (int i = 0; i < ar.Length; i++)
                {
                    if (ar[i] is PlaceholderAdorner1)
                    {
                        lay.Remove(ar[i]);
                    }
                }
            }

            if (txt.Text.Length == 0)
                lay.Add(new PlaceholderAdorner1(txt, e.NewValue.ToString()));

        };
        txt.Loaded += loadHandler;
        txt.TextChanged += (s1, e1) =>
        {
            bool isShow = txt.Text.Length == 0;

            var lay = AdornerLayer.GetAdornerLayer(txt);
            if (lay == null) return;

            if (isShow)
            {
                lay.Add(new PlaceholderAdorner1(txt, e.NewValue.ToString()));
            }
            else
            {
                Adorner[] ar = lay.GetAdorners(txt);
                if (ar != null)
                {
                    for (int i = 0; i < ar.Length; i++)
                    {
                        if (ar[i] is PlaceholderAdorner1)
                        {
                            lay.Remove(ar[i]);
                        }
                    }
                }
            }
        };
    }
        
可以看到，附加属性只是对于装饰器的删除和添加，别无其他。  
运行看看效果，都还不错，第一种实现所出现的问题也都能解决，但是随即发现一个问题：

* 当隐藏（设置TextBox的Visibility为Hidden时），发现TextBox隐藏了，但是装饰器还存在。  

##使用装饰器实现-2

---

针对上述的问题，首先分析问题原因，首先知道OnRender方法是在UIElement中定义，看方法的注释中，意思似乎是只在布局改变时才调用，从OnRender方面下手几乎不可能。  
回想WinForm出现此类情况的解决方案，无非是调用Invalidate之类的，但是存在一个时机的问题。  
如果当TextBox的Visibility改变时，能获取通知，上述问题就可以解决，而且直接可以删除改装饰器。  
鉴于WPF中的触发器能得到某个属性改变的通知，那么我们自己肯定也能得到。  

    public PlaceholderAdorner1(UIElement ele, string placeholder)
        : base(ele)
    {
        _placeholder = placeholder;

        var dpd = DependencyPropertyDescriptor.FromProperty(UIElement.VisibilityProperty, typeof(UIElement));
        dpd.AddValueChanged(ele, new EventHandler((s1, e1) =>
        {
            this.InvalidateVisual();
        }));
    }

测试发现，上述问题确实已经解决。  
当然，除了可以在装饰器中重绘一次，还可以直接在属性改变时直接删除该装饰器。  

    var dpd = DependencyPropertyDescriptor.FromProperty(UIElement.VisibilityProperty, typeof(UIElement));
    dpd.AddValueChanged(txt, new EventHandler((s1, e1) =>
    {
        bool isShow = txt.Text.Length == 0 && txt.Visibility == Visibility.Visible;

        var lay = AdornerLayer.GetAdornerLayer(txt);
        if (lay == null) return;

        if (isShow)
        {
            lay.Add(new PlaceholderAdorner1(txt, e.NewValue.ToString()));
        }
        else
        {
            Adorner[] ar = lay.GetAdorners(txt);
            if (ar != null)
            {
                for (int i = 0; i < ar.Length; i++)
                {
                    if (ar[i] is PlaceholderAdorner1)
                    {
                        lay.Remove(ar[i]);
                    }
                }
            }
        }
    }));

这段代码当然直接可以写在OnPlaceholder2Changed事件处理函数中。  

##装饰器的另一种实现方式

---

由于某次手动生成触发器的时候，发现注册属性改变通知和触发器还是有一定的不同的（具体问题有时间再提）。  
所以对于这种实现方式总是心有余悸。  
所幸装饰器除了使用OnRender方法，还有别的实现方式。  

    public class PlaceholderAdorner2 : Adorner
    {
        private VisualCollection _visCollec;
        private TextBlock _tb;
        private TextBox _txt;

        public PlaceholderAdorner2(UIElement ele, string placeholder)
            : base(ele)
        {
            _txt = ele as TextBox;
            if (_txt == null) return;

            Binding bd = new Binding("IsVisible");
            bd.Source = _txt;
            bd.Mode = BindingMode.OneWay;
            bd.Converter = new BoolToVisibilityConverter();
            this.SetBinding(TextBox.VisibilityProperty, bd);
            _visCollec = new VisualCollection(this);
            _tb = new TextBlock();
            _tb.Style = null;
            _tb.FontSize = _txt.FontSize;
            _tb.FontFamily = _txt.FontFamily;
            _tb.FontWeight = _txt.FontWeight;
            _tb.FontStretch = _txt.FontStretch;
            _tb.FontStyle = FontStyles.Italic;
            _tb.Foreground = Brushes.Gray;
            _tb.Text = placeholder;
            _tb.IsHitTestVisible = false;
            _visCollec.Add(_tb);
        }

        protected override int VisualChildrenCount
        {
            get
            {
                return _visCollec.Count;
            }
        }

        protected override Size ArrangeOverride(Size finalSize)
        {
            _tb.Arrange(new Rect(new Point(4, 2), finalSize));
            return finalSize;
        }

        protected override Visual GetVisualChild(int index)
        {
            return _visCollec[index];
        }
    }

代码不难理解，就是给TextBox上面又放了一个TextBlock，并且把TextBlock的Visibility属性和TextBox的Visibility属性绑定。  

end.
